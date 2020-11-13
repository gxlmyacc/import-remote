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
// const webpack = require('webpack');
const loaderUtils = require('loader-utils');

// @ts-ignore
const WebPackError = require('webpack/lib/WebpackError.js');
const webpackMajorVersion = Number(require('webpack/package.json').version.split('.')[0]);

const { CachedChildCompilation } = require('./lib/cached-child-compiler');

const prettyError = require('./lib/errors.js');
const chunkSorter = require('./lib/chunksorter.js');
const getModuleWebpackPluginHooks = require('./lib/hooks.js').getModuleWebpackPluginHooks;

const fsStatAsync = promisify(fs.stat);
const fsReadFileAsync = promisify(fs.readFile);


/**
 * resolve globalObject
  * @param {ProcessedModuleWebpackOptions} options
  * @returns {string}
  */
// @ts-ignore
function resolveScopeName(options) {
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
  const scopeName = resolveScopeName(options);
  return scopeName
    ? `${options.globalObject || '__context__'}.__remoteModuleWebpack__['${scopeName}']`
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

function resolveModulePath(compilation, moduleName) {
  let v = require.resolve(moduleName);
  if (!v) return '';
  return path.relative(compilation.options.context, v).replace(/\\/g, '/');
}

/**
 * resolve webpack externals
 * @param {WebpackCompilation} compilation
  * @param {ProcessedModuleWebpackOptions} options
  * @returns {Array<string>}
  */
function resolveExternals(compilation, options) {
  // @ts-ignore
  return [...compilation.modules].filter(m => m.external).map(m => {
    let v = { id: m.id };
    // @ts-ignore
    if (isPlainObject(m.request)) {
      // @ts-ignore
      let varName = m.request.root || m.request.commonjs;
      if (!varName) return;
      // @ts-ignore
      Object.assign(v, { name: m.userRequest, var: varName });
    } else {
      // @ts-ignore
      Object.assign(v, { name: m.request, var: m.request });
    }
    v.path = resolveModulePath(compilation, v.name);
    return v;
  }).filter(Boolean);
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
      scopeName: resolveScopeName(options),
      ...assets,
      options
    }
  };
}

// function findHMRPluginIndex(config) {
//   if (!config.plugins) {
//     config.plugins = [];
//     return;
//   }
//   return config.plugins.findIndex(plugin => plugin.constructor === webpack.HotModuleReplacementPlugin);
// }

// function addHMRPlugin(config) {
//   const idx = findHMRPluginIndex(config);
//   if (idx < 0) config.plugins.push(new webpack.HotModuleReplacementPlugin());
// }

// function removeHMRPlugin(config) {
//   const idx = findHMRPluginIndex(config);
//   if (~idx) config.plugins.splice(idx, 1);
// }

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
      modulesMapFile: 'module.map.json',
      runtime: /(manifest|runtime~).+[.]js$/,
      hash: false,
      compile: true,
      cache: true,
      showErrors: true,
      chunks: 'all',
      excludeChunks: [],
      chunksSortMode: 'auto',
      replaceGlobalObject: false,
      globalToScopes: [],
      scopeName: options => options.package.name,
      base: false,
    };

    /** @type {ProcessedModuleWebpackOptions} */
    this.options = Object.assign(defaultOptions, userOptions);

    if (!this.options.template || !/\.js$/.test(this.options.template)) this.options.template = 'auto';
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

    if (!compiler.options.optimization.runtimeChunk) {
      compiler.options.optimization.runtimeChunk = true;
    }

    const packageFile = findUp.sync('package.json', { cwd: compiler.context || process.cwd() });
    this.options.package = require(packageFile);
    this.options.projectPath = path.dirname(packageFile);
    this.options.nodeModulesPath = path.relative(compiler.context, path.resolve(this.options.projectPath, './node_modules')).replace(/\\/g, '/');
    this.options.template = this.getFullTemplatePath(this.options.template, compiler.context);

    // Inject child compiler plugin
    const childCompilerPlugin = new CachedChildCompilation(compiler);
    if (!this.options.templateContent) {
      childCompilerPlugin.addEntry(this.options.template);
    }

    // convert absolute filename into relative so that webpack can
    // generate it at correct location
    const filename = this.options.filename;
    if (path.resolve(filename) === path.normalize(filename)) {
      this.options.filename = path.relative(compiler.options.output.path, filename);
    }

    if (!compiler.options.output.devtoolNamespace) {
      compiler.options.output.devtoolNamespace = '(import-remote)/' + resolveScopeName(this.options);
    }

    // `contenthash` is introduced in webpack v4.3
    // which conflicts with the plugin's existing `contenthash` method,
    // hence it is renamed to `templatehash` to avoid conflicts
    this.options.filename = this.options.filename.replace(/\[(?:(\w+):)?contenthash(?::([a-z]+\d*))?(?::(\d+))?\]/ig, match => match.replace('contenthash', 'templatehash'));

    compiler.hooks.afterPlugins.tap('ModuleWebpackPlugin', compiler => {
      // addHMRPlugin(compiler.options);
    });

    compiler.hooks.emit.tapAsync('ModuleWebpackPlugin',
      /**
       * Hook into the webpack emit phase
       * @param {WebpackCompilation} compilation
       * @param {(err?: Error) => void} callback
      */
      (compilation, callback) => {
        // Get all entry point names for this html file
        const entryNames = Array.from(compilation.entrypoints.keys());
        const filteredEntryNames = self.filterChunks(entryNames, self.options.chunks, self.options.excludeChunks);
        const sortedEntryNames = self.sortEntryChunks(filteredEntryNames, this.options.chunksSortMode, compilation);

        const templateResult = this.options.templateContent
          ? { mainCompilationHash: compilation.hash }
          : childCompilerPlugin.getCompilationEntryResult(this.options.template);

        this.childCompilerHash = templateResult.mainCompilationHash;

        if ('error' in templateResult) {
          compilation.errors.push(prettyError(templateResult.error, compiler.context).toString());
        }

        const compiledEntries = 'compiledEntry' in templateResult ? {
          hash: templateResult.compiledEntry.hash,
          chunk: templateResult.compiledEntry.entry
        } : {
          hash: templateResult.mainCompilationHash
        };

        const childCompilationOutputName = webpackMajorVersion === 4
          ? compilation.mainTemplate.getAssetPath(this.options.filename, compiledEntries)
          // @ts-ignore
          : compilation.getAssetPath(this.options.filename, compiledEntries);

        // If the child compilation was not executed during a previous main compile run
        // it is a cached result
        const isCompilationCached = templateResult.mainCompilationHash !== compilation.hash;

        // Turn the entry point names into file paths
        const assets = self.moduleWebpackPluginAssets(compilation, childCompilationOutputName, sortedEntryNames, this.options.publicPath);

        // If the template and the assets did not change we don't have to emit the html
        const assetJson = JSON.stringify(self.getAssetFiles(assets));
        if (isCompilationCached && self.options.cache && assetJson === self.assetJson) {
          return callback();
        }
        self.assetJson = assetJson;


        // The html-webpack plugin uses a object representation for the html-tags which will be injected
        // to allow altering them more easily
        // Just before they are converted a third-party-plugin author might change the order and content

        // Turn the compiled template into a nodejs function or into a nodejs string
        const templateEvaluationPromise = Promise.resolve()
          .then(() => {
            if ('error' in templateResult) {
              return self.options.showErrors ? prettyError(templateResult.error, compiler.context).toHtml() : 'ERROR';
            }
            // Allow to use a custom function / string instead
            if (self.options.templateContent !== false) {
              return self.options.templateContent;
            }
            // Once everything is compiled evaluate the html factory
            // and replace it with its content
            return ('compiledEntry' in templateResult)
              ? self.evaluateCompilationResult(compilation, templateResult.compiledEntry.content)
              : Promise.reject(new Error('Child compilation contained no compiledEntry'));
          });

        const templateExectutionPromise = templateEvaluationPromise
          // Execute the template
          .then(compilationResult => (typeof compilationResult !== 'function'
            ? compilationResult
            : self.executeTemplate(compilationResult, assets, compilation)));

        const injectedTemplatePromise = templateExectutionPromise
          // Allow plugins to change the html before assets are injected
          .then(html => {
            const pluginArgs = { html, plugin: self, outputName: childCompilationOutputName };
            return getModuleWebpackPluginHooks(compilation).afterTemplateExecution.promise(pluginArgs);
          });

        const emitHtmlPromise = injectedTemplatePromise
          // Allow plugins to change the html after assets are injected
          .then(html => {
            const pluginArgs = { html: isPlainObject(html) ? html.html : html, plugin: self, outputName: childCompilationOutputName };
            // @ts-ignore
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

            if (this.options.modulesMapFile) {
              // @ts-ignore
              compilation.assets[this.options.modulesMapFile] = self.getModulesMapAsset(compilation);
            }
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
   * @returns { { source: () => string, size: () => number } }
   */
  getModulesMapAsset(compilation) {
    const assets = {};

    function resolvePath(modulePath) {
      if (modulePath.includes('!')) {
        let paths = modulePath.split('!').filter(Boolean);
        modulePath = paths[paths.length - 1] || '';
      }
      return modulePath.split('?')[0];
    }
    // @ts-ignore
    compilation.modules.forEach(module => {
      let moduleId = module.id;
      if (moduleId === '') return;
      const asset = {};
      // @ts-ignore
      let request = resolvePath((module.userRequest || ''));
      let modulePath = '';
      // @ts-ignore
      if (module.external) {
        modulePath = resolveModulePath(compilation, request);
      } else {
        if (!request) {
          // @ts-ignore
          if (module._identifier) request = resolvePath(module._identifier.split(' ')[
            // @ts-ignore
            module._identifier.startsWith('multi ') ? 1 : 0
          ]);
        }
        
        modulePath = (path.isAbsolute(request) 
          ? path.relative(compilation.options.context, request)
          : request).replace(/\\/g, '/');
      }
      if (modulePath) {
        modulePath = modulePath.split('?')[0];
        if (!/^\.\.?\//.test(modulePath)) modulePath = './' + modulePath;
        const packageFile = findUp.sync('package.json', { cwd: path.resolve(compilation.compiler.context, modulePath) });
        if (packageFile && packageFile.includes('node_modules')) {
          const pkg = require(packageFile);
          // if (modulePath !== moduleId) 
          asset.id = moduleId;
          asset.name = pkg.name;
          // asset.version = pkg.version;
        }
      } 
      assets[modulePath] = asset;
    });
    const assetStr = JSON.stringify(assets);
    return { 
      source: () => assetStr,
      size: () => assetStr.length
    };
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
    const vmContext = vm.createContext(_.extend({ MODULE_WEBPACK_PLUGIN: true, require, console }, global));
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
        if (templateParameters === false) {
          return Promise.resolve({});
        }
        if (typeof templateParameters !== 'function' && typeof templateParameters !== 'object') {
          throw new Error('templateParameters has to be either a function or an object');
        }
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
  moduleWebpackPluginAssets(compilation, childCompilationOutputName, entryNames, customPublicPath) {
    const compilationHash = compilation.hash;

    /**
     * @type {string} the configured public path to the asset root
     * if a path publicPath is set in the current webpack config use it otherwise
     * fallback to a relative path
     */
    const webpackPublicPath = webpackMajorVersion === 4
      ? compilation.mainTemplate.getPublicPath({ hash: compilationHash })
      // @ts-ignore
      : compilation.getAssetPath(compilation.outputOptions.publicPath, { hash: compilationHash });

    const isPublicPathDefined = webpackMajorVersion === 4
      ? webpackPublicPath.trim() !== ''
      // Webpack 5 introduced "auto" - however it can not be retrieved at runtime
      : webpackPublicPath.trim() !== '' && webpackPublicPath !== 'auto';

    let publicPath
      // If the html-webpack-plugin options contain a custom public path uset it
      = customPublicPath != null && customPublicPath !== 'auto'
        ? customPublicPath
        : (isPublicPathDefined
          // If a hard coded public path exists use it
          ? webpackPublicPath
          // If no public path was set get a relative url path
          : path.relative(path.resolve(compilation.options.output.path, path.dirname(childCompilationOutputName)), compilation.options.output.path)
            .split(path.sep).join('/')
        );

    if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
      publicPath += '/';
    }

    const assetKeys = Object.keys(compilation.assets);
    const jsonpFunction = compilation.mainTemplate.outputOptions.jsonpFunction;
    if (this.options.replaceGlobalObject) {
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
    }

    const assets = {
      modulesMapFile: this.options.modulesMapFile,
      // The public path
      publicPath,
      // the entry file
      entryFile: '',
      // then entry id
      entryId: 0,
      // hash
      hash: compilationHash,
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

    // let runtimeChunkIdx = -1;
    compilation.chunks.forEach((chunk, i) => {
      if (chunk.hasRuntime()) {
        // if (entryNames.some(entryName => chunk.name.includes(entryName))) {
        //   runtimeChunkIdx = i;
        // }
        return;
      }
      chunk.files.forEach(file => {
        // if (file.endsWith('.hot-update.js')) return;
        if ((/\.(css)(\?|$)/).test(file)) assets.chunks.files.css[chunk.id] = file;
        else if ((/\.(js|mjs)(\?|$)/).test(file)) {
          if (!assets.chunks.files.js[chunk.id]) {
            assets.chunks.files.js[chunk.id] = file;
            return;
          } 
          if (!Array.isArray(assets.chunks.files.js[chunk.id])) {
            assets.chunks.files.js[chunk.id] = [assets.chunks.files.js[chunk.id]];
          }
          assets.chunks.files.js[chunk.id].push(file);
        }
      });
    });
    // if (~runtimeChunkIdx) compilation.chunks.splice(runtimeChunkIdx, 1);

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
      // @ts-ignore
      assets.entryId = entryModule.id;
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
        return true;
      }
    });

    // Extract paths to .js, .mjs and .css files from the current compilation
    const entryPointPublicPathMap = {};
    const extensionRegexp = /\.(css|js|mjs)(\?|$)/;
    for (let i = 0; i < entryNames.length; i++) {
      const entryName = entryNames[i];
      const entrypoints = compilation.entrypoints.get(entryName);
      const runtimeChunk = entrypoints.runtimeChunk;

      // let runtimeChunkIdx = -1;
      // entrypoints.chunks.some((chunk, i) => {
      //   if (chunk.hasRuntime()) {
      //     runtimeChunkIdx = i;
      //     return true;
      //   }
      // });
      // if (~runtimeChunkIdx) entrypoints.chunks.splice(i, 1);

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
          const entryPointPublicPath = publicPath + this.urlencodePath(chunkFile);
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
   * Encode each path component using `encodeURIComponent` as files can contain characters
   * which needs special encoding in URLs like `+ `.
   *
   * Valid filesystem characters which need to be encoded for urls:
   *
   * # pound, % percent, & ampersand, { left curly bracket, } right curly bracket,
   * \ back slash, < left angle bracket, > right angle bracket, * asterisk, ? question mark,
   * blank spaces, $ dollar sign, ! exclamation point, ' single quotes, " double quotes,
   * : colon, @ at sign, + plus sign, ` backtick, | pipe, = equal sign
   *
   * However the query string must not be encoded:
   *
   *  fo:demonstration-path/very fancy+name.js?path=/home?value=abc&value=def#zzz
   *    ^             ^    ^    ^     ^    ^  ^    ^^    ^     ^   ^     ^   ^
   *    |             |    |    |     |    |  |    ||    |     |   |     |   |
   *    encoded       |    |    encoded    |  |    ||    |     |   |     |   |
   *                 ignored              ignored  ignored     ignored   ignored
   *
   * @param {string} filePath
   */
  urlencodePath(filePath) {
    // People use the filepath in quite unexpected ways.
    // Try to extract the first querystring of the url:
    //
    // some+path/demo.html?value=abc?def
    //
    const queryStringStart = filePath.indexOf('?');
    const urlPath = queryStringStart === -1 ? filePath : filePath.substr(0, queryStringStart);
    const queryString = filePath.substr(urlPath.length);
    // Encode all parts except '/' which are not part of the querystring:
    const encodedUrlPath = urlPath.split('/').map(encodeURIComponent).join('/');
    return encodedUrlPath + queryString;
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
