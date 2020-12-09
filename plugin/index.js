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

const promisify = require('util').promisify;

const vm = require('vm');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
// @ts-ignore
const findUp = require('find-up');
// const webpack = require('webpack');
const loaderUtils = require('loader-utils');
// const { sync: getBabelOptionsSync } = require('read-babelrc-up');

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
 * resolve scopeName
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

function resolveModuleResource(compilation, resource = '') {
  resource = path.relative(compilation.options.context, resource).replace(/\\/g, '/');
  if (!/^\.\.?\//.test(resource)) resource = './' + resource;
  return resource;
}

function resolveModuleFile(compilation, module) {
  // @ts-ignore
  let request = module.request;
  if (!request
    // @ts-ignore
    && module._identifier
    // @ts-ignore
    && module._identifier.startsWith('multi ')) {
    // @ts-ignore
    module = module.dependencies[module.dependencies.length - 1];
    // @ts-ignore
    request = module && module.request;
  }
  if (!request) return '';
  if (request) request = request.split('?')[0];
  return path.isAbsolute(request) 
    ? path.relative(compilation.options.context, request).replace(/\\/g, '/')
    : request;
}

function isEvalDevtool(devtool) {
  return typeof devtool === 'string' && /^(eval|inline)/.test(String(devtool));
}

/**
 * resolve batch replaces
 * @param {ModuleWebpackPlugin} self
 * @param {WebpackCompilation} compilation
* @param {ProcessedModuleWebpackOptions} options
* @returns 
*/
function resolveBatchReplaces(self, compilation, options) {
  let ret = [];
  const isEval = isEvalDevtool(compilation.options.devtool);
  [...compilation.modules].filter(m => m.type === 'javascript/auto').forEach(m => {
    // @ts-ignore
    let rawRequest = m.rawRequest || '';
    if (rawRequest === 'react-error-overlay') {
      ret.push(...[
        [/\bwindow\.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__\b/g, '__windowProxy__.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__'],
        [/\bwindow\.parent\.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__\b/g, `window.parent.__remoteModuleWebpack__[${isEval ? '\\' : ''}"%SCOPE_NAME%${isEval ? '\\' : ''}"].__windowProxy__.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__`]
      ]);
    }
  });
  return ret;
}

function getModuleId(compilation, module) {
  return compilation.chunkGraph
    ? compilation.chunkGraph.getModuleId(module)
    : module.id;
}

/**
 * resolve webpack remotes
 * @param {ModuleWebpackPlugin} self
 * @param {WebpackCompilation} compilation
* @param {ProcessedModuleWebpackOptions} options
* @returns 
*/
function resolveShareModules(self, compilation, options) {
  if (!options.shareModules || !options.shareModules.length) return [];
  const shareModules = options.shareModules.map(v => {
    if (isPlainObject(v)) return v.name ? v : undefined;
    return v ? { name: v } : undefined;
  }).filter(Boolean);
  const ret = [];
  [...compilation.modules].filter(m => m.type === 'javascript/auto').forEach(m => {
    let isRegx;
    // @ts-ignore
    let rawRequest = m.rawRequest || '';
    // @ts-ignore
    let resource = m.resource || '';
    if (resource) resource = resolveModuleResource(compilation, resource);
    let shareItem = shareModules.find(v => {
      isRegx = false;
      if (!rawRequest) return;
      if (typeof v.name === 'string') return v.name === rawRequest;
      if (v.name instanceof RegExp) {
        isRegx = true;
        return v.name.test(resource);
      }
      if (typeof v.name === 'function') return v.name(resource, rawRequest, m);
    });
    if (!shareItem) return;
    let name = rawRequest;
    if (isRegx) {
      // @ts-ignore
      const packageFile = findUp.sync('package.json', { cwd: path.dirname(m.resource) });
      if (!packageFile || !packageFile.includes('node_modules')) return;
      const pkg = require(packageFile);
      // @ts-ignore
      name = path.join(pkg.name, path.relative(path.dirname(packageFile), m.resource)).replace(/\\/g, '/');
    }
    let item = { name, id: getModuleId(compilation, m) };
    if (shareItem.var) item.var = shareItem.var;
    if (shareItem.version) item.version = shareItem.version;
    // if (typeof item.version === 'function') {
    //   // const { babel } = getBabelOptionsSync();
    //   let fnStr = item.version.toString();
    //   if (/^[A-Za-z0-9_$]*\s?\(([A-Za-z0-9_$\s,]*)\)\s*{/.test(fnStr)) fnStr = `function ${fnStr}`;
    //   let str = require('@babel/core').transformSync(fnStr, {
    //     babelrc: true,
    //     configFile: true,
    //     plugins: ['@babel/plugin-transform-arrow-functions', '@babel/plugin-transform-destructuring']
    //   });
    //   console.log(str);
    // }
    if (shareItem.getVersion) item.getVersion = shareItem.getVersion;
    ret.push(item);
  });
  return ret;
}

/**
 * resolve webpack remotes
 * @param {ModuleWebpackPlugin} self
 * @param {WebpackCompilation} compilation
* @param {ProcessedModuleWebpackOptions} options
* @returns {{ chunkMapping: {}, idToExternalAndNameMapping: {} }}
*/
function resolveRemotes(self, compilation, options) { 
  const remotes = { 
    withBaseURI: self.withBaseURI,
    hasJsMatcher: self.hasJsMatcher,
    chunkMapping: {}, 
    idToExternalAndNameMapping: {},
    initCodePerScope: self.initCodePerScope,
    initialConsumes: self.initialConsumes,
    moduleIdToSourceMapping: self.moduleIdToSourceMapping,
    chunkToModuleMapping: self.chunkToModuleMapping,
  };
  if (webpackMajorVersion < 5) return remotes;

  // @ts-ignore
  const miniCssFModule = compilation._modules.get('webpack/runtime/get mini-css chunk filename');
  if (miniCssFModule) {
    // @ts-ignore
    remotes.miniCssF = miniCssFModule._cachedGeneratedCode
      .replace('// This function allow to reference all chunks\n__webpack_require__.miniCssF = ', '');
  }

  [...compilation.modules].forEach(m => {
    if (m.type === 'remote-module') {
      const mid = getModuleId(compilation, m);
      // @ts-ignore
      remotes.idToExternalAndNameMapping[mid] = [m.shareScope, m.internalRequest, m.externalRequests[0]];
      m.chunksIterable.forEach(c => {
        if (!remotes.chunkMapping[c.id]) remotes.chunkMapping[c.id] = [];
        remotes.chunkMapping[c.id].push(mid);
      });
    }
    if (m.type === 'consume-shared-module') {
      // console.log(m);
    }
    if (m.type === 'provide-module') {
      // console.log(m);
    }
  });
  return remotes;
}

/**
 * resolve webpack externals
 * @param {WebpackCompilation} compilation
  * @param {ProcessedModuleWebpackOptions} options
  * @returns {Array<string>}
  */
function resolveExternals(compilation, options) {
  // @ts-ignore
  return [...compilation.modules].filter(m => {
    // @ts-ignore
    if (webpackMajorVersion < 5) return m.external;
    // @ts-ignore
    return m.externalType === 'var';
  }).map(m => {
    // @ts-ignore
    let v = { id: getModuleId(compilation, m), type: m.externalType };
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
    pkg: options.package,
    webpackVersion: webpackMajorVersion,
    outputOptions: compilation.outputOptions,
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
      globalToScopes: [],
      scopeName: options => options.package.name,
      base: false,
    };

    this.hasJsMatcher = null;
    this.withBaseURI = false;
    this.initCodePerScope = {}; 
    this.initialConsumes = []; 
    this.moduleIdToSourceMapping = {};
    this.chunkToModuleMapping = {};

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
    // Wait for configuration preset plugions to apply all configure webpack defaults
    compiler.hooks.initialize.tap('HtmlWebpackPlugin', () => {
      if (!compiler.options.optimization.runtimeChunk) {
        compiler.options.optimization.runtimeChunk = true;
      }
  
      const packageFile = findUp.sync('package.json', { cwd: compiler.context || process.cwd() });
      self.options.package = require(packageFile);
      self.options.projectPath = path.dirname(packageFile);
      self.options.nodeModulesPath = path.relative(compiler.context, path.resolve(self.options.projectPath, './node_modules')).replace(/\\/g, '/');
      self.options.template = self.getFullTemplatePath(self.options.template, compiler.context);
    
    
      // entryName to fileName conversion function
      const userOptionFilename = self.options.filename;
      const filenameFunction = typeof userOptionFilename === 'function'
        ? userOptionFilename
      // Replace '[name]' with entry name
        : entryName => userOptionFilename.replace(/\[name\]/g, entryName);
    
      /** output filenames for the given entry names */
      const outputFileNames = new Set(Object.keys(compiler.options.entry).map(filenameFunction));
    
      /** Option for every entry point */
      const entryOptions = Array.from(outputFileNames).map(filename => ({
        ...self.options,
        filename
      }));
    
      // Hook all options into the webpack compiler
      entryOptions.forEach(instanceOptions => {
        hookIntoCompiler(compiler, instanceOptions, this);
      });
    });


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

    if (webpackMajorVersion >= 5) {
      compiler.hooks.compilation.tap('ModuleWebpackPlugin', compilation => {
        // @ts-ignore
        const RuntimeGlobals = require('webpack/lib/RuntimeGlobals');
        // @ts-ignore
        const compileBooleanMatcher = require('webpack/lib/util/compileBooleanMatcher');
        // @ts-ignore
        const chunkHasJs = require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;

        // @ts-ignore
        const globalChunkLoading = compilation.outputOptions.chunkLoading;
        const isEnabledForChunk = chunk => {
          const options = chunk.getEntryOptions();
          const chunkLoading
            = (options && options.chunkLoading) || globalChunkLoading;
          return chunkLoading === 'jsonp';
        };
        const onceForChunkSet = new WeakSet();
        const handler = (chunk, set) => {
          if (onceForChunkSet.has(chunk)) return;
          onceForChunkSet.add(chunk);
          if (!isEnabledForChunk(chunk)) return;
          set.add(RuntimeGlobals.moduleFactoriesAddOnly);
          set.add(RuntimeGlobals.hasOwnProperty);

          const withBaseURI = set.has(RuntimeGlobals.baseURI);
          if (withBaseURI) self.withBaseURI = true;

          let hasJsMatcher = compileBooleanMatcher(
            // @ts-ignore
            compilation.chunkGraph.getChunkConditionMap(chunk, chunkHasJs)
          );
          if (typeof hasJsMatcher === 'function') {
            let str = hasJsMatcher('');
            // @ts-ignore
            hasJsMatcher = str.substr(2, str.length - '!//.test()'.length);
          }
          // @ts-ignore
          if (hasJsMatcher) self.hasJsMatcher = hasJsMatcher;
        };
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.baseURI)
          .tap('ModuleWebpackPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap('ModuleWebpackPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('ModuleWebpackPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap('ModuleWebpackPlugin', handler);

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.shareScopeMap)
          .tap('ModuleWebpackPlugin', (chunk, set) => {
            const {
              compareModulesByIdentifier,
            // @ts-ignore
            } = require('webpack/lib/util/comparators');

            const isNumber = typeof chunk.id === 'number';

            const getChunkIdFormSource = (source, async = false) => {
              let ret = [];
              if (async) {
                let arr;
                let regx = new RegExp(/__webpack_require__\.e\("?([0-9A-Za-z_-]+)"?\)/g);
                while (arr = regx.exec(source)) {
                  ret.push(isNumber ? Number(arr[1]) : arr[1]);
                }
                return ret;
              }
              let [, entryId] = source.match(/__webpack_require__\((?:\/\*[0-9A-Za-z_\-_/.! ]+\*\/ )?"?([0-9A-Za-z_\-_/.]+)"?\)/) || [];
              if (entryId != null) ret.push(isNumber ? Number(entryId) : entryId);
              return ret;
            };
                  
            const initCodePerScope = {};
            for (const c of chunk.getAllReferencedChunks()) {
              // @ts-ignore
              const modules = compilation.chunkGraph.getOrderedChunkModulesIterableBySourceType(
                c,
                'share-init',
                compareModulesByIdentifier
              );
              if (!modules) continue;
              for (const m of modules) {
                // @ts-ignore
                const data = compilation.codeGenerationResults.getData(
                  m,
                  c.runtime,
                  'share-init'
                );
                if (!data) continue;
                for (const item of data) {
                  const { shareScope, init } = item;
                  const [, shareKey, version] = init.match(/^register\("([^"]+)", "([^"]+)"/) || [];
                  let stage;
                  if (shareKey) {
                    let [entryId] = getChunkIdFormSource(init);
                    stage = [
                      'register', 
                      shareKey, 
                      version, 
                      getChunkIdFormSource(init, true),
                      entryId
                    ];
                  }
                  const [, entryId] = init.match(/^initExternal\("?([0-9A-Za-z_\-_/.]+)"?\)/) || [];
                  if (entryId) {
                    stage = ['init', entryId];
                  }
                  let stages = initCodePerScope[shareScope];
                  if (stages == null) initCodePerScope[shareScope] = stages = [];
                  if (stage) stages.push(stage);
                }
              }
            }
            self.initCodePerScope = initCodePerScope;

            const moduleIdToSourceMapping = {};
            const addModules = (modules, chunk, list) => {
              for (const m of modules) {
                const module = m;
                // @ts-ignore
                const id = compilation.chunkGraph.getModuleId(module);
                list.push(id);
                // @ts-ignore
                const source = compilation.codeGenerationResults.getSource(
                  module,
                  chunk.runtime,
                  'consume-shared'
                // @ts-ignore
                )._value;
                moduleIdToSourceMapping[id] = [
                  module.options.shareScope,
                  module.options.shareKey,
                  module.options.requiredVersion,
                  getChunkIdFormSource(source, true)
                ];
                let [entryId] = getChunkIdFormSource(source);
                if (entryId != null) moduleIdToSourceMapping[id].push(entryId);
              }
            };

            const chunkToModuleMapping = {};
            for (const c of chunk.getAllAsyncChunks()) {
              // @ts-ignore
              const modules = compilation.chunkGraph.getChunkModulesIterableBySourceType(
                c,
                'consume-shared'
              );
              if (!modules) continue;
              addModules(modules, c, (chunkToModuleMapping[c.id] = []));
            }
            self.chunkToModuleMapping = chunkToModuleMapping;
          
            const initialConsumes = [];
            for (const c of chunk.getAllInitialChunks()) {
              // @ts-ignore
              const modules = compilation.chunkGraph.getChunkModulesIterableBySourceType(
                c,
                'consume-shared'
              );
              if (!modules) continue;
              addModules(modules, c, initialConsumes);
            }
            self.initialConsumes = initialConsumes;
            self.moduleIdToSourceMapping = moduleIdToSourceMapping;

            return true;
          });
      });
    }

    compiler.hooks.emit.tapAsync('ModuleWebpackPlugin',
      /**
       * Hook into the webpack emit phase
       * @param {WebpackCompilation} compilation
       * @param {(err?: Error) => void} callback
      */
      (compilation, callback) => {
        // Get all entry point names for this html file
        // @ts-ignore
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
        const templateEvaluationPromise = (Promise.resolve())
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
    // @ts-ignore
    compilation.modules.forEach(module => {
      // @ts-ignore
      if (module.external || module.externalType || !module.resource
        || ['runtime', 'remote-module'].includes(module.type) 
        || getModuleId(compilation, module) != null
      ) return;
      const asset = {};
      // @ts-ignore
      let resource = resolveModuleResource(compilation, module.resource);
      // @ts-ignore
      const packageFile = findUp.sync('package.json', { cwd: path.dirname(module.resource) });
      if (packageFile && packageFile.includes('node_modules')) {
        const pkg = require(packageFile);
        asset.id = getModuleId(compilation, module);
        asset.name = pkg.name;
      }
      // asset.version = pkg.version;
      assets[resource] = asset;
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
    const jsonpFunction = compilation.outputOptions.chunkLoadingGlobal
      || compilation.outputOptions.jsonpFunction;

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
      remotes: {},
      shareModules: [],
      batchReplaces: [],
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

    assets.batchReplaces = resolveBatchReplaces(this, compilation, this.options);
    assets.shareModules = resolveShareModules(this, compilation, this.options);
    assets.remotes = resolveRemotes(this, compilation, this.options);
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

    const checkEntryModule = entryModule => {
      // @ts-ignore
      assets.entryId = getModuleId(compilation, entryModule);
      if (webpackMajorVersion >= 5) {
        return assets.entryId;
      }
      if (entryModule.buildMeta.providedExports || entryModule.buildMeta.exportsType) {
        assets.entryFile = resolveModuleFile(compilation, entryModule);
        return Boolean(assets.entryFile);
      }
    };
    const chunks = compilation.chunks instanceof Set ? Array.from(compilation.chunks) : compilation.chunks;
    const entryChunk = chunks.find(c => {
      if (webpackMajorVersion < 5) {
        // @ts-ignore
        if (!c.entryModule || !entryNames.includes(c.entryModule.name)) return; 
        checkEntryModule(c.entryModule);
        return true;
      }
      // @ts-ignore
      if (!c.id || !entryNames.includes(c.id)) return;
      const entryModule = compilation.chunkGraph.getChunkRootModules(c).find(m => m.type === 'javascript/auto');
      if (entryModule) checkEntryModule(entryModule);
      // if (assets.hot) {
      //   const entryModule = [...c.modulesIterable].find(m => m.type === 'javascript/auto');
      //   checkEntryModule(entryModule);
      // } else checkEntryModule(c.entryModule);
      return true;
    });

    // Extract paths to .js, .mjs and .css files from the current compilation
    const entryPointPublicPathMap = {};
    const extensionRegexp = /\.(css|js|mjs)(\?|$)/;
    for (let i = 0; i < entryNames.length; i++) {
      const entryName = entryNames[i];
      const entrypoints = compilation.entrypoints.get(entryName);
      // @ts-ignore
      const runtimeChunk = entrypoints._runtimeChunk || entrypoints.runtimeChunk;

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

      const entryFiles = entryChunk.files instanceof Set ? Array.from(entryChunk.files) : entryChunk.files;
      const runtimeFiles = runtimeChunk.files instanceof Set ? Array.from(runtimeChunk.files) : runtimeChunk.files;

      // Prepend the publicPath and append the hash depending on the
      // webpack.output.publicPath and hashOptions
      // E.g. bundle.js -> /bundle.js?hash
      const entryPointPublicPaths = entryPointFiles
        .map(chunkFile => {
          const entryPointPublicPath = publicPath + this.urlencodePath(chunkFile);
          const isJs = /\.(js|mjs)(\?|$)/.test(chunkFile);
        
          const isEntry = Boolean(entryChunk && entryFiles.includes(chunkFile));
          let item = {
            file: this.options.hash
              ? this.appendHash(entryPointPublicPath, compilationHash)
              : entryPointPublicPath,
            isRuntime: Boolean(runtimeChunk && runtimeFiles.includes(chunkFile)),
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
