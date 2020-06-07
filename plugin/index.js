// @ts-check
// Import types
/** @typedef {import("./typings").HtmlTagObject} HtmlTagObject */
/** @typedef {import("./typings").Options} ModuleWebpackOptions */
/** @typedef {import("./typings").ProcessedOptions} ProcessedModuleWebpackOptions */
/** @typedef {import("./typings").TemplateAssets} TemplateAssets */
/** @typedef {import("./typings").TemplateParameter} TemplateParameter */
/** @typedef {import("webpack/lib/Compiler.js")} WebpackCompiler */
/** @typedef {import("webpack/lib/Compilation.js")} WebpackCompilation */
/** @typedef {import("webpack/lib/WebpackError.js")} WebpackError */

// use Polyfill for util.promisify in node versions < v8
const promisify = require('util.promisify');

const vm = require('vm');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
// @ts-ignore
const findUp = require('find-up');
const webpack = require('webpack');
const loaderUtils = require('loader-utils');

// @ts-ignore
const WebPackError = require('webpack/lib/WebpackError.js');
const childCompiler = require('./lib/compiler.js');
const prettyError = require('./lib/errors.js');
const chunkSorter = require('./lib/chunksorter.js');
const getModuleWebpackPluginHooks = require('./lib/hooks.js').getModuleWebpackPluginHooks;

const fsStatAsync = promisify(fs.stat);
const fsReadFileAsync = promisify(fs.readFile);

/**
 * resolve globalObject
 * @param {WebpackCompilation} compilation
  * @param {ProcessedModuleWebpackOptions} options
  * @returns {string}
  */
// @ts-ignore
function resolveScopeName(compilation, options) {
  let scopeName = options.scopeName;
  if (typeof scopeName === 'function') scopeName = scopeName(options);
  return scopeName;
}

/**
 * resolve globalObject
 * @param {WebpackCompilation} compilation
  * @param {ProcessedModuleWebpackOptions} options
  * @returns {string}
  */
function resolveGlobalObject(compilation, options) {
  const outputOptions = compilation.mainTemplate.outputOptions;
  const scopeName = resolveScopeName(compilation, options);
  return scopeName
    ? `window.__remoteModuleWebpack__['${scopeName}']`
    : outputOptions.globalObject;
}

/**
 * is Plain Object
 * @param {any} v
  * @returns {boolean}
  */
function isPlainObject(v) {
  return toString.call(v) === '[object Object]';
}

/**
 * resolve webpack externals
 * @param {WebpackCompilation} compilation
  * @param {ProcessedModuleWebpackOptions} options
  * @returns {Array<string>}
  */
function resolveExternals(compilation, options) {
  let ret = [];
  // @ts-ignore
  let externals = [...compilation._modules].filter(m => m[0].startsWith('external ')).map(([, m]) => {
    // @ts-ignore
    let v = m.request;
    // @ts-ignore
    if (isPlainObject(v)) v.request = m.userRequest;
    return v;
  }).filter(Boolean);
  const _path = key => {
    let v = require.resolve(key);
    if (!v) return '';
    return path.relative(compilation.options.context, v).replace(/\\/g, '/');
  };
  const _obj = obj => {
    let r = [];
    Object.keys(obj).forEach(key => {
      let v = obj[key];
      if (!v) return;
      let item = {};
      if (typeof v === 'string') Object.assign(item, { name: key, var: v });
      else if (v.root) Object.assign(item, { name: key, var: v.root });
      else if (v.commonjs) Object.assign(item, { name: key, var: v.commonjs });
      else return;
      item.path = _path(key);
      r.push(item);
    });
    return r;
  };
  const _arr = arr => {
    let r = [];
    arr.forEach(v => {
      if (!v) return;
      let item = {};
      if (typeof v === 'string') {
        Object.assign(item, { name: v, var: v });
      } else if (isPlainObject(v)) {
        if (v.root) Object.assign(item, { name: v.request, var: v.root });
        else if (v.commonjs) Object.assign(item, { name: v.request, var: v.commonjs });
        else return r.push(..._obj(v));
      } else return;
      item.path = _path(item.name);
      r.push(item);
    });
    return r;
  };
  ret.push(..._arr(externals));
  return ret;
}


/**
 * The default for options.templateParameter
 * Generate the template parameters
 *
 * Generate the template parameters for the template function
 * @param {WebpackCompilation} compilation
 * @param {TemplateAssets} assets
 * @param {ProcessedModuleWebpackOptions} options
 * @param {number} version
 * @returns {TemplateParameter}
 */
function templateParametersGenerator(compilation, assets, options, version) {
  return {
    version,
    compilation,
    globalObject: resolveGlobalObject(compilation, options),
    pkg: options.package,
    webpackConfig: compilation.options,
    moduleWebpackPlugin: {
      scopeName: resolveScopeName(compilation, options),
      ...assets,
      options
    }
  };
}

function findHMRPluginIndex(config) {
  if (!config.plugins) {
    config.plugins = [];
    return;
  }
  return config.plugins.findIndex((plugin) => plugin.constructor === webpack.HotModuleReplacementPlugin);
};

function addHMRPlugin(config) {
  const idx = findHMRPluginIndex(config);
  if (idx < 0) config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

function removeHMRPlugin(config) {
  const idx = findHMRPluginIndex(config);
  if (~idx) config.plugins.splice(idx, 1);
};

class ModuleWebpackPlugin {

  /**
   * @param {ModuleWebpackOptions} [options]
   */
  constructor(options) {
    /** @type {ModuleWebpackOptions} */
    const userOptions = options || {};

    // Default options
    /** @type {ProcessedModuleWebpackOptions} */
    const defaultOptions = {
      template: 'auto',
      templateContent: false,
      templateParameters: null,
      filename: 'index.js',
      runtime: /(manifest|runtime~).+[.]js$/,
      hash: false,
      compile: true,
      cache: true,
      showErrors: true,
      chunks: 'all',
      excludeChunks: [],
      chunksSortMode: 'auto',
      scopeName: options => options.package.name,
      base: false,
    };

    /** @type {ProcessedModuleWebpackOptions} */
    this.options = Object.assign(defaultOptions, userOptions);

    if (!/\.js$/.test(this.options.template)) this.options.template = 'auto';
    if (/\.html$/.test(this.options.filename)) {
      this.options.filename = path.basename(this.options.filename, '.html') + '.js';
    }

    // Instance variables to keep caching information
    // for multiple builds
    this.childCompilerHash = undefined;
    /**
     * @type {string | undefined}
     */
    this.childCompilationOutputName = undefined;
    this.assetJson = undefined;
    this.hash = undefined;
    this.version = ModuleWebpackPlugin.version;
  }

  /**
   * apply is called by the webpack main compiler during the start phase
   * @param {WebpackCompiler} compiler
   */
  apply(compiler) {
    const self = this;
    let isCompilationCached = false;
    /** @type Promise<string> */
    let compilationPromise;

    if (!compiler.options.optimization.runtimeChunk) {
      compiler.options.optimization.runtimeChunk = true;
    }

    const packageFile = findUp.sync('package.json', { cwd: compiler.context || process.cwd() });
    this.options.package = require(packageFile);
    this.options.projectPath = path.dirname(packageFile);
    this.options.nodeModulesPath = path.relative(compiler.context, path.resolve(this.options.projectPath, './node_modules')).replace(/\\/g, '/');
    this.options.template = this.getFullTemplatePath(this.options.template, compiler.context);

    // convert absolute filename into relative so that webpack can
    // generate it at correct location
    const filename = this.options.filename;
    if (path.resolve(filename) === path.normalize(filename)) {
      this.options.filename = path.relative(compiler.options.output.path, filename);
    }

    // `contenthash` is introduced in webpack v4.3
    // which conflicts with the plugin's existing `contenthash` method,
    // hence it is renamed to `templatehash` to avoid conflicts
    this.options.filename = this.options.filename.replace(/\[(?:(\w+):)?contenthash(?::([a-z]+\d*))?(?::(\d+))?\]/ig, match => match.replace('contenthash', 'templatehash'));

    // Clear the cache once a new ModuleWebpackPlugin is added
    childCompiler.clearCache(compiler);
    
    compiler.hooks.afterPlugins.tap('ModuleWebpackPlugin', compiler => {
      addHMRPlugin(compiler.options);
    });
    
    // Register all ModuleWebpackPlugins instances at the child compiler
    compiler.hooks.thisCompilation.tap('ModuleWebpackPlugin', compilation => {
      removeHMRPlugin(compiler.options);
      // Clear the cache if the child compiler is outdated
      if (childCompiler.hasOutDatedTemplateCache(compilation)) {
        childCompiler.clearCache(compiler);
      }
      // Add this instances template to the child compiler
      childCompiler.addTemplateToCompiler(compiler, this.options.template);
      // Add file dependencies of child compiler to parent compiler
      // to keep them watched even if we get the result from the cache
      compilation.hooks.additionalChunkAssets.tap('ModuleWebpackPlugin', () => {
        const childCompilerDependencies = childCompiler.getFileDependencies(compiler);
        childCompilerDependencies.forEach(fileDependency => {
          compilation.compilationDependencies.add(fileDependency);
        });
      });
    });

    compiler.hooks.make.tapAsync('ModuleWebpackPlugin', (compilation, callback) => {
      // Compile the template (queued)
      compilationPromise = childCompiler.compileTemplate(self.options.template, self.options.filename, compilation)
        .catch(err => {
          compilation.errors.push(prettyError(err, compiler.context).toString());
          return {
            content: self.options.showErrors ? prettyError(err, compiler.context).toJsonHtml() : 'ERROR',
            outputName: self.options.filename,
            hash: ''
          };
        })
        .then(compilationResult => {
          // If the compilation change didnt change the cache is valid
          isCompilationCached = Boolean(compilationResult.hash) && self.childCompilerHash === compilationResult.hash;
          self.childCompilerHash = compilationResult.hash;
          self.childCompilationOutputName = compilationResult.outputName;
          callback();
          return compilationResult.content;
        });
    });

    compiler.hooks.emit.tapAsync('ModuleWebpackPlugin',
      /**
       * Hook into the webpack emit phase
       * @param {WebpackCompilation} compilation
       * @param {() => void} callback
      */
      (compilation, callback) => {
        // Get all entry point names for this html file
        const entryNames = Array.from(compilation.entrypoints.keys());
        const filteredEntryNames = self.filterChunks(entryNames, self.options.chunks, self.options.excludeChunks);
        const sortedEntryNames = self.sortEntryChunks(filteredEntryNames, this.options.chunksSortMode, compilation);
        const childCompilationOutputName = self.childCompilationOutputName;

        if (childCompilationOutputName === undefined) {
          throw new Error('Did not receive child compilation result');
        }

        // Turn the entry point names into file paths
        const assets = self.moduleWebpackPluginAssets(compilation, childCompilationOutputName, sortedEntryNames);

        // If this is a hot update compilation, move on!
        // This solves a problem where an `index.html` file is generated for hot-update js files
        // It only happens in Webpack 2, where hot updates are emitted separately before the full bundle
        if (self.isHotUpdateCompilation(assets)) {
          return callback();
        }

        // If the template and the assets did not change we don't have to emit the html
        const assetJson = JSON.stringify(self.getAssetFiles(assets));
        if (isCompilationCached && self.options.cache && assetJson === self.assetJson) {
          return callback();
        }
        self.assetJson = assetJson;


        // The html-webpack plugin uses a object representation for the html-tags which will be injected
        // to allow altering them more easily
        // Just before they are converted a third-party-plugin author might change the order and content

        // Turn the compiled tempalte into a nodejs function or into a nodejs string
        const templateEvaluationPromise = compilationPromise
          .then(compiledTemplate => {
            // Allow to use a custom function / string instead
            if (self.options.templateContent !== false) {
              return self.options.templateContent;
            }
            // Once everything is compiled evaluate the html factory
            // and replace it with its content
            return self.evaluateCompilationResult(compilation, compiledTemplate);
          });

        const templateExectutionPromise = templateEvaluationPromise
          // Execute the template
          .then(compilationResult => (typeof compilationResult !== 'function'
            ? compilationResult
            : self.executeTemplate(compilationResult, assets, compilation)));


        const emitHtmlPromise = templateExectutionPromise
          // Allow plugins to change the html after assets are injected
          .then(html => {
            const pluginArgs = { html, plugin: self, outputName: childCompilationOutputName };
            return getModuleWebpackPluginHooks(compilation).beforeEmit.promise(pluginArgs)
              .then(result => result.html);
          })
          .catch(err => {
            // In case anything went wrong the promise is resolved
            // with the error message and an error is logged
            compilation.errors.push(prettyError(err, compiler.context).toString());
            // Prevent caching
            self.hash = null;
            return self.options.showErrors ? prettyError(err, compiler.context).toHtml() : 'ERROR';
          })
          .then(html => {
            // Allow to use [templatehash] as placeholder for the import-remote name
            // See also https://survivejs.com/webpack/optimizing/adding-hashes-to-filenames/
            // eslint-disable-next-line max-len
            // From https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/8de6558e33487e7606e7cd7cb2adc2cccafef272/src/index.js#L212-L214
            const finalOutputName = childCompilationOutputName.replace(
              /\[(?:(\w+):)?templatehash(?::([a-z]+\d*))?(?::(\d+))?\]/ig,
              (_, hashType, digestType, maxLength) => loaderUtils.getHashDigest(
                Buffer.from(html, 'utf8'),
                hashType,
                digestType,
                // eslint-disable-next-line radix
                parseInt(maxLength, 10)
              )
            );
            // Add the evaluated html code to the webpack assets
            // @ts-ignore
            compilation.assets[finalOutputName] = {
              source: () => html,
              size: () => html.length
            };
            return finalOutputName;
          })
          .then(finalOutputName => getModuleWebpackPluginHooks(compilation).afterEmit.promise({
            outputName: finalOutputName,
            plugin: self
          }).catch(err => {
            console.error(err);
            return null;
          }).then(() => null));

        // Once all files are added to the webpack compilation
        // let the webpack compiler continue
        emitHtmlPromise.then(() => {
          callback();
        });
      });
  }

  /**
   * Evaluates the child compilation result
   * @param {WebpackCompilation} compilation
   * @param {string} source
   * @returns {Promise<string | (() => string | Promise<string>)>}
   */
  // @ts-ignore
  evaluateCompilationResult(compilation, source) {
    if (!source) {
      return Promise.reject(new Error('The child compilation didn\'t provide a result'));
    }
    // The LibraryTemplatePlugin stores the template result in a local variable.
    // To extract the result during the evaluation this part has to be removed.
    source = source.replace('var MODULE_WEBPACK_PLUGIN_RESULT =', '');
    const template = this.options.template.replace(/^.+!/, '').replace(/\?.+$/, '');
    const vmContext = vm.createContext(_.extend({ MODULE_WEBPACK_PLUGIN: true, require }, global));
    const vmScript = new vm.Script(source, { filename: template });
    // Evaluate code and cast to string
    let newSource;
    try {
      newSource = vmScript.runInContext(vmContext);
    } catch (e) {
      return Promise.reject(e);
    }
    if (typeof newSource === 'object' && newSource.__esModule && newSource.default) {
      newSource = newSource.default;
    }
    return typeof newSource === 'string' || typeof newSource === 'function'
      ? Promise.resolve(newSource)
      : Promise.reject(new Error('The loader "' + this.options.template + '" didn\'t return html.'));
  }

  /**
   * Generate the template parameters for the template function
   * @param {WebpackCompilation} compilation
   * @param {TemplateAssets} assets
   * @returns {Promise<{[key: any]: any}>}
   */
  getTemplateParameters(compilation, assets) {
    return Promise
      .resolve()
      .then(() => templateParametersGenerator(compilation, assets, this.options, this.version))
      .then(params => {
        const templateParameters = this.options.templateParameters;
        if (typeof templateParameters === 'object') Object.assign(params, templateParameters);
        if (typeof templateParameters === 'function') {
          return Promise
            .resolve()
            .then(() => templateParameters(compilation, assets, this.options, this.version))
            .then(params2 => Object.assign(params, params2));
        }
        return params;
      });
  }

  /**
   * This function renders the actual html by executing the template function
   *
   * @param {(templateParameters) => string | Promise<string>} templateFunction
   * @param {TemplateAssets} assets
   * @param {WebpackCompilation} compilation
   *
   * @returns Promise<string>
   */
  executeTemplate(templateFunction, assets, compilation) {
    // Template processing
    const templateParamsPromise = this.getTemplateParameters(compilation, assets);
    return templateParamsPromise.then(templateParams => {
      try {
        // If html is a promise return the promise
        // If html is a string turn it into a promise
        return templateFunction(templateParams);
      } catch (e) {
        compilation.errors.push(new WebPackError('Template execution failed: ' + e));
        return Promise.reject(e);
      }
    });
  }

  /*
   * Pushes the content of the given filename to the compilation assets
   * @param {string} filename
   * @param {WebpackCompilation} compilation
   *
   * @returns {string} file basename
   */
  addFileToAssets(filename, compilation) {
    filename = path.resolve(compilation.compiler.context, filename);
    return Promise.all([
      fsStatAsync(filename),
      fsReadFileAsync(filename)
    ])
      .then(([size, source]) => ({
        size,
        source
      }))
      .catch(() => Promise.reject(new Error('ModuleWebpackPlugin: could not load file ' + filename)))
      .then(results => {
        const basename = path.basename(filename);
        compilation.fileDependencies.add(filename);
        compilation.assets[basename] = {
          source: () => results.source,
          size: () => results.size.size
        };
        return basename;
      });
  }

  /**
   * Helper to sort chunks
   * @param {string[]} entryNames
   * @param {string|((entryNameA: string, entryNameB: string) => number)} sortMode
   * @param {WebpackCompilation} compilation
   */
  sortEntryChunks(entryNames, sortMode, compilation) {
    // Custom function
    if (typeof sortMode === 'function') {
      return entryNames.sort(sortMode);
    }
    // Check if the given sort mode is a valid chunkSorter sort mode
    if (typeof chunkSorter[sortMode] !== 'undefined') {
      return chunkSorter[sortMode](entryNames, compilation, this.options);
    }
    throw new Error('"' + sortMode + '" is not a valid chunk sort mode');
  }

  /**
   * Return all chunks from the compilation result which match the exclude and include filters
   * @param {any} chunks
   * @param {string[]|'all'} includedChunks
   * @param {string[]} excludedChunks
   */
  filterChunks(chunks, includedChunks, excludedChunks) {
    return chunks.filter(chunkName => {
      // Skip if the chunks should be filtered and the given chunk was not added explicity
      if (Array.isArray(includedChunks) && includedChunks.indexOf(chunkName) === -1) {
        return false;
      }
      // Skip if the chunks should be filtered and the given chunk was excluded explicity
      if (Array.isArray(excludedChunks) && excludedChunks.indexOf(chunkName) !== -1) {
        return false;
      }
      // Add otherwise
      return true;
    });
  }

  /**
   * Check if the given asset object consists only of hot-update.js files
   *
   * @param {TemplateAssets} assets
   */
  isHotUpdateCompilation(assets) {
    return assets.entrys.js.length && assets.entrys.js.every(assetPath => /\.hot-update\.js$/.test(assetPath.file));
  }

  /**
   * The ModuleWebpackPluginAssets extracts the asset information of a webpack compilation
   * for all given entry names
   * @param {WebpackCompilation} compilation
   * @param {string[]} entryNames
   * @returns {TemplateAssets}
   */
  moduleWebpackPluginAssets(compilation, childCompilationOutputName, entryNames) {
    const compilationHash = compilation.hash;

    /**
     * @type {string} the configured public path to the asset root
     * if a path publicPath is set in the current webpack config use it otherwise
     * fallback to a realtive path
     */
    const webpackPublicPath = compilation.mainTemplate.getPublicPath({ hash: compilationHash });
    const isPublicPathDefined = webpackPublicPath.trim() !== '';
    let publicPath = isPublicPathDefined
      // If a hard coded public path exists use it
      ? webpackPublicPath
      // If no public path was set get a relative url path
      : path.relative(path.resolve(compilation.options.output.path, path.dirname(childCompilationOutputName)), compilation.options.output.path)
        .split(path.sep).join('/');

    if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
      publicPath += '/';
    }

    const assetKeys = Object.keys(compilation.assets);
    const jsonpFunction = compilation.mainTemplate.outputOptions.jsonpFunction;
    const globalObject = compilation.mainTemplate.outputOptions.globalObject;
    const newGlobalObject = resolveGlobalObject(compilation, this.options);
    if (newGlobalObject !== globalObject) {
      const jsRegexp = /\.(js)(\?|$)/;
      const sourcePrefix1 = `(${globalObject}["${jsonpFunction}"] = ${globalObject}["${jsonpFunction}"] || [])`;
      const sourcePrefix2 = `(${globalObject}.${jsonpFunction}=${globalObject}.${jsonpFunction}||[])`;
      const newSourcePrefix1 = `(${newGlobalObject}['${jsonpFunction}']=${newGlobalObject}['${jsonpFunction}']||[])`;
      const handleSource = source => {
        if (!source || typeof source !== 'string') return source;
        if (source.startsWith(sourcePrefix1)) return newSourcePrefix1 + source.substr(sourcePrefix1.length);
        if (source.startsWith(sourcePrefix2)) return newSourcePrefix1 + source.substr(sourcePrefix2.length);
        return source;
      };
      assetKeys.forEach(key => {
        if (!jsRegexp.test(key)) return;
        const asset = compilation.assets[key];
        // @ts-ignore
        if (asset.children) {
          // @ts-ignore
          asset.children.forEach(source => {
            const value = handleSource(source._value);
            if (value === source._value) return;
            source._value = value;
          });
        } else if (asset.source) {
          // @ts-ignore
          let source = asset.source();
          const value = handleSource(source);
          if (value === source) return;
          asset.source = () => value;
          asset.size = () => value.length;
        }
      });
    }


    const assets = {
      // The public path
      publicPath,
      // the entry file
      entryFile: '',
      // jsonpFunction 
      jsonpFunction,
      // is hot
      hot: Boolean(compilation.compiler.watchMode),
      // the webpack externals
      externals: [],
      // Will contian all chunk files
      chunks: {
        files: {
          js: {},
          css: {},
        }
      },
      entrys: {
        ids: [],
        // Will contain all js and mjs files
        js: [],
        // Will contain all css files
        css: [],
      },
      // Will contain the html5 appcache manifest files if it exists
      manifest: assetKeys.find(assetFile => path.extname(assetFile) === '.appcache'),
    };

    compilation.chunks.forEach(chunk => {
      if (chunk.hasRuntime()) {
        chunk.files.forEach(file => delete compilation.assets[file]);
        return;
      }
      chunk.files.forEach(file => {
        if ((/\.(css)(\?|$)/).test(file)) assets.chunks.files.css[chunk.id] = file;
        else if ((/\.(js|mjs)(\?|$)/).test(file)) assets.chunks.files.js[chunk.id] = file;
      });
    });

    assets.externals = resolveExternals(compilation, this.options);

    // assetKeys.forEach(file => {
    //   if (!path.basename(file).match(this.options.runtime)) return;
    //   // Will contain runtime/manifest js files
    //   const source = compilation.assets[file].source();
    //   assets.runtime = {
    //     file,
    //     source
    //   };
    // });

    // Append a hash for cache busting
    if (this.options.hash && assets.manifest) {
      assets.manifest = this.appendHash(assets.manifest, compilationHash);
    }

    const entryChunk = compilation.chunks.find(c => {
      // @ts-ignore
      if (!c.entryModule || !entryNames.includes(c.entryModule.name)) return; 
      let entryModule = c && c.entryModule;
      if (entryModule.buildMeta.providedExports) {
        // @ts-ignore
        let request = entryModule.request;
        if (!request
          // @ts-ignore
          && entryModule._identifier
          // @ts-ignore
          && entryModule._identifier.startsWith('multi ')) {
          // @ts-ignore
          entryModule = entryModule.dependencies[entryModule.dependencies.length - 1];
          // @ts-ignore
          request = entryModule && entryModule.request;
        }
        if (!request) return;
        if (request) request = request.split('?')[0];
        assets.entryFile = path.isAbsolute(request) 
          ? path.relative(compilation.options.context, request).replace(/\\/g, '/')
          : request;
      }
    });

    // Extract paths to .js, .mjs and .css files from the current compilation
    const entryPointPublicPathMap = {};
    const extensionRegexp = /\.(css|js|mjs)(\?|$)/;
    for (let i = 0; i < entryNames.length; i++) {
      const entryName = entryNames[i];
      const entrypoints = compilation.entrypoints.get(entryName);
      const runtimeChunk = entrypoints.runtimeChunk;
      const entryPointFiles = entrypoints.getFiles();

      assets.entrys.ids.push(...entrypoints.chunks.map(c => ({
        id: c.id,
        isEntry: entryChunk === c,
        isRuntime: runtimeChunk === c
      })));

      // Prepend the publicPath and append the hash depending on the
      // webpack.output.publicPath and hashOptions
      // E.g. bundle.js -> /bundle.js?hash
      const entryPointPublicPaths = entryPointFiles
        .map(chunkFile => {
          const entryPointPublicPath = publicPath + chunkFile;
          const isJs = /\.(js|mjs)(\?|$)/.test(chunkFile);
          const isEntry = Boolean(entryChunk && ~entryChunk.files.indexOf(chunkFile));
          let item = {
            file: this.options.hash
              ? this.appendHash(entryPointPublicPath, compilationHash)
              : entryPointPublicPath,
            isRuntime: Boolean(runtimeChunk && runtimeChunk.files.includes(chunkFile)),
            isEntry
          };
          if (isEntry && isJs) {
            const asset = compilation.assets[chunkFile];
            // @ts-ignore
            let [, entryFile] = asset.source().match(/module.exports\s?=\s?__webpack_require__\(.+"(.+)"\);\s/) || [];
            if (entryFile) assets.entryFile = entryFile;
          }
          return item;
        });

      entryPointPublicPaths.forEach(asset => {
        const entryPointPublicPath = asset.file;
        const extMatch = extensionRegexp.exec(entryPointPublicPath);
        // Skip if the public path is not a .css, .mjs or .js file
        if (!extMatch) {
          return;
        }
        // Skip if this file is already known
        // (e.g. because of common chunk optimizations)
        if (entryPointPublicPathMap[entryPointPublicPath]) {
          return;
        }
        entryPointPublicPathMap[entryPointPublicPath] = true;
        // ext will contain .js or .css, because .mjs recognizes as .js
        const ext = extMatch[1] === 'mjs' ? 'js' : extMatch[1];
        assets.entrys[ext].push(asset);
      });
    }
    return assets;
  }

  /**
   * Appends a cache busting hash to the query string of the url
   * E.g. http://localhost:8080/ -> http://localhost:8080/?50c9096ba6183fd728eeb065a26ec175
   * @param {string} url
   * @param {string} hash
   */
  appendHash(url, hash) {
    if (!url) {
      return url;
    }
    return url + (url.indexOf('?') === -1 ? '?' : '&') + hash;
  }

  /**
   * Helper to return the absolute template path with a fallback loader
   * @param {string} template
   * The path to the template e.g. './index.js'
   * @param {string} context
   * The webpack base resolution path for relative paths e.g. process.cwd()
   */
  getFullTemplatePath(template, context) {
    if (template === 'auto') {
      template = path.join(__dirname, 'default_index.js');
    }
    // If the template doesn't use a loader use the lodash template loader
    if (template.indexOf('!') === -1) {
      template = require.resolve('./lib/loader.js') + '!' + path.resolve(context, template);
    }
    // Resolve template path
    return template.replace(
      /([!])([^/\\][^!?]+|[^/\\!?])($|\?[^!?\n]+$)/,
      // @ts-ignore
      (match, prefix, filepath, postfix) => prefix + path.resolve(filepath) + postfix
    );
  }

  /**
   * Helper to return a sorted unique array of all asset files out of the
   * asset object
   */
  getAssetFiles(assets) {
    const files = _.uniq(Object.keys(assets).filter(assetType => assetType !== 'chunks' && assets[assetType])
      .reduce((files, assetType) => {
        let asset = assets[assetType];
        return files.concat(Array.isArray(asset) ? asset.map(v => v.file) : asset);
      }, []));
    files.sort();
    return files;
  }

}

// Statics:
/**
 * The major version number of this plugin
 */
ModuleWebpackPlugin.version = 1;

/**
 * A static helper to get the hooks for this plugin
 *
 * Usage: ModuleWebpackPlugin.getHooks(compilation).HOOK_NAME.tapAsync('YourPluginName', () => { ... });
 */
ModuleWebpackPlugin.getHooks = getModuleWebpackPluginHooks;

module.exports = ModuleWebpackPlugin;
