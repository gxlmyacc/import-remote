/* eslint-disable camelcase */
import { DEFAULT_TIMEOUT, joinUrl } from './utils';
import fetch, { globalCached } from './fetch';
import importCss from './importCss';
import importJs from './importJs';
import jsonp from './jsonp';
import { versionLt, rangeToString, satisfy } from './semver';

function createRuntime({
  jsonpFunction = 'webpackJsonp',
  publicPath = '',
  host = '',
  devtool = false,
  hot,
  hash = '',
  uniqueName = '',
  scopeName = '',
  hotUpdateGlobal = '',
  cssChunks = {},
  jsChunks = {},
  context = {},
  webpackVersion = 4,
  initCodePerScope = {},
  cached = globalCached,
  timeout = DEFAULT_TIMEOUT,
  requireExternal,
  beforeSource,
  remotes = {}
} = {}) {
  let __webpack_modules__ = {};
  /** ********************************************************************* */
  // The module cache
  let __webpack_module_cache__ = {};

  let chunkLoadingGlobal = context[jsonpFunction] = context[jsonpFunction] || [];
  let parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
  chunkLoadingGlobal.push = webpackJsonpCallback;
    
  // The require function
  function __webpack_require__(moduleId, entryFile) {
    // Check if module is in cache
    if (__webpack_module_cache__[moduleId]) {
      return __webpack_module_cache__[moduleId].exports;
    }
    if (!__webpack_modules__[moduleId] && entryFile && __webpack_modules__[entryFile]) moduleId = entryFile;
    if (!__webpack_modules__[moduleId]) {
      let result = requireExternal(moduleId);
      if (result !== undefined) return result;

      throw new Error(`[import-remote]module[${moduleId}] not exist!`);
    }
    // Create a new module (and put it into the cache)
    let module = __webpack_module_cache__[moduleId] = {
      inRemoteModule: true,
      requireExternal,
      publicPath,
      id: moduleId,
      loaded: false,
      exports: {}
    };
    
    // Execute the module function
    let execOptions = { id: moduleId, module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
    __webpack_require__.i.forEach(function (handler) { handler(execOptions); });
    module = execOptions.module;
    execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
    
    // Flag the module as loaded
    if (Object.getOwnPropertyDescriptor(module, 'loaded').value !== undefined) {
      module.loaded = true;
    }
 
    // Return the exports of the module
    return module.exports;
  }
    
  // expose the modules object (__webpack_modules__)
  __webpack_require__.m = __webpack_modules__;
    
  // expose the module cache
  __webpack_require__.c = __webpack_module_cache__;
    
  // expose the module execution interceptor
  __webpack_require__.i = [];
    
  /** ********************************************************************* */
  /* webpack/runtime/compat get default export */
  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = module => {
    let getter = module && module.__esModule
      ? () => module.default
      : () => module;
    __webpack_require__.d(getter, { a: getter });
    return getter;
  };
    
  /* webpack/runtime/create fake namespace object */
  // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 8|1: behave like require
  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = this(value);
    if (mode & 8) return value;
    if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    let ns = Object.create(null);
    __webpack_require__.r(ns);
    let def = {};
    if (mode & 2 && typeof value == 'object' && value) {
    // eslint-disable-next-line guard-for-in
      for (const key in value) def[key] = () => value[key];
    }
    def.default = () => value;
    __webpack_require__.d(ns, def);
    return ns;
  };
    
  /* webpack/runtime/define property getters */
  // define getter functions for harmony exports
  __webpack_require__.d = (exports, definition, getter) => {
    if (getter) {
      if (!__webpack_require__.o(exports, definition)) {
        Object.defineProperty(exports, definition, { enumerable: true, get: getter });
      }
      return;
    }

    for (let key in definition) {
      if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
        Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
      }
    }
  };
    
  /* webpack/runtime/ensure chunk */
  __webpack_require__.f = {};
  // This file contains only the entry chunk.
  // The chunk loading function for additional chunks
  __webpack_require__.e = chunkId => Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
    __webpack_require__.f[key](chunkId, promises);
    return promises;
  }, []));
    
  /* webpack/runtime/get javascript chunk filename */
  // This function allow to reference async chunks
  __webpack_require__.u = chunkId => 
  // return url for filenames based on template
    jsChunks[chunkId] || chunkId + '.js';
    
  /* webpack/runtime/get javascript update chunk filename */
  // This function allow to reference all chunks
  __webpack_require__.hu = chunkId => 
  // return url for filenames based on template
    '' + chunkId + '.' + __webpack_require__.h() + '.hot-update.js';
    
  /* webpack/runtime/get mini-css chunk filename */
  // This function allow to reference all chunks
  let _miniCssF = null;
  __webpack_require__.miniCssF = chunkId => {
    let file = cssChunks[chunkId];
    if (file) return file;
    // eslint-disable-next-line no-eval
    if (!_miniCssF) _miniCssF = remotes._miniCssF ? eval(remotes._miniCssF) : () => false;
    return _miniCssF(chunkId);
  };
    
  /* webpack/runtime/get update manifest filename */
  __webpack_require__.hmrF = () => '' + __webpack_require__.h() + '.hot-update.json';
    
  /* webpack/runtime/getFullHash */
  __webpack_require__.h = () => hash;
    
  /* webpack/runtime/global */
  __webpack_require__.g = (function () {
    // eslint-disable-next-line no-undef
    if (typeof globalThis === 'object') return globalThis;
    try {
    // eslint-disable-next-line no-new-func
      return this || new Function('return this')();
    } catch (e) {
      if (typeof window === 'object') return window;
    }
  })();
    
  /* webpack/runtime/hasOwnProperty shorthand */
  __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    
  /* webpack/runtime/load script */
  let inProgress = {};
  // loadScript function to load a script via script tag
  __webpack_require__.l = (url, done, key) => {
    if (inProgress[url]) { inProgress[url].push(done); return; }
    inProgress[url] = [done];
    let onScriptComplete = ex => {
      let doneFns = inProgress[url] || [];
      delete inProgress[url];
      doneFns && doneFns.forEach(fn => fn && fn(ex));
    };
    if (!Array.isArray(url)) url = [url];
    let fn = webpackVersion < 5 || !key || key.startsWith('chunk-')
      ? importJs
      : jsonp;
    return Promise.all(url.map(u => fn(u, { 
      timeout,
      global: context,
      cached,
      scopeName,
      host,
      devtool,
      beforeSource, 
      key: key ? `${uniqueName}:${key}` : ''
    }))) 
      .then(onScriptComplete)
      .catch(onScriptComplete);
  };
    
  /* webpack/runtime/make namespace object */
  // define __esModule on exports
  __webpack_require__.r = exports => {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };
    
  /* webpack/runtime/node module decorator */
  __webpack_require__.nmd = module => {
    module.paths = [];
    if (!module.children) module.children = [];
    return module;
  };
    
  /* webpack/runtime/remotes loading */
  let chunkMapping = remotes.chunkMapping || {};
  let idToExternalAndNameMapping = remotes.idToExternalAndNameMapping || {};
  __webpack_require__.f.remotes = (chunkId, promises) => {
    if (__webpack_require__.o(chunkMapping, chunkId)) {
      chunkMapping[chunkId].forEach(id => {
        let getScope = __webpack_require__.R;
        if (!getScope) getScope = [];
        let data = idToExternalAndNameMapping[id];
        if (getScope.indexOf(data) >= 0) return;
        getScope.push(data);
        if (data.p) return promises.push(data.p);
        let onError = error => {
          if (!error) error = new Error('Container missing');
          if (typeof error.message === 'string') error.message += '\nwhile loading "' + data[1] + '" from ' + data[2];
          __webpack_modules__[id] = () => {
            throw error;
          };
          data.p = 0;
        };
        let handleFunction = (fn, arg1, arg2, d, next, first) => {
          try {
            let promise = fn(arg1, arg2);
            if (promise && promise.then) {
              let p = promise.then(result => next(result, d), onError);
              if (first) promises.push(data.p = p); else return p;
            } else {
              return next(promise, d, first);
            }
          } catch (error) {
            onError(error);
          }
        };
        let onFactory = factory => {
          data.p = 1;
          __webpack_modules__[id] = module => {
            module.exports = factory();
          };
        };
        let onInitialized = (_, external, first) => handleFunction(external.get, data[1], getScope, 0, onFactory, first);
        let onExternal = (external, _, first) => (external 
          ? handleFunction(__webpack_require__.I, data[0], 0, external, onInitialized, first) 
          : onError());
        handleFunction(__webpack_require__, data[2], 0, 0, onExternal, 1);
      });
    }
  };
    
  /* webpack/runtime/sharing */
  (() => {
    __webpack_require__.S = {};
    let initPromises = {};
    let initTokens = {};
    __webpack_require__.I = (name, initScope) => {
      if (!initScope) initScope = [];
      // handling circular init calls
      let initToken = initTokens[name];
      if (!initToken) initToken = initTokens[name] = {};
      if (initScope.indexOf(initToken) >= 0) return;
      initScope.push(initToken);
      // only runs once
      if (initPromises[name]) return initPromises[name];
      // creates a new share scope if needed
      if (!__webpack_require__.o(__webpack_require__.S, name)) __webpack_require__.S[name] = {};
      // runs all init snippets from all modules reachable
      let scope = __webpack_require__.S[name];
      let warn = msg => typeof console !== 'undefined' && console.warn && console.warn(msg);
      let register = (name, version, factory) => {
        let versions = scope[name] = scope[name] || {};
        let activeVersion = versions[version];
        if ((!activeVersion || !activeVersion.loaded) && uniqueName > activeVersion.from) {
          versions[version] = { get: factory, from: uniqueName };
        }
      };
      let promises = [];
      let initExternal = id => {
        let handleError = err => warn('Initialization of sharing external failed: ' + err);
        try {
          let module = __webpack_require__(id);
          if (!module) return;
          let initFn = module => module && module.init && module.init(__webpack_require__.S[name], initScope);
          if (module.then) return promises.push(module.then(initFn, handleError));
          let initResult = initFn(module);
          if (initResult && initResult.then) return promises.push(initResult.catch(handleError));
        } catch (err) { handleError(err); }
      };

      const initCode = initCodePerScope[name] || [];
      if (initCode) {
        initCode.forEach(item => {
          const [type] = item;
          if (type === 'register') {
            const [, shareKey, version, chunkIds, entryId] = item;
            register(shareKey, version, () => Promise.all(chunkIds.map(id => __webpack_require__.e(id)))
              .then(() => () => __webpack_require__(entryId)));
          }
          if (type === 'init') {
            const [, entryId] = item;
            initExternal(entryId);
          }
        });
      }
      if (!promises.length) return initPromises[name] = 1;
      return initPromises[name] = Promise.all(promises).then(() => initPromises[name] = 1);
    };
  })();
    
  /* webpack/runtime/hot module replacement */
  (() => {
    let currentModuleData = {};
    let installedModules = __webpack_require__.c;
      
    // module and require creation
    let currentChildModule;
    let currentParents = [];
      
    // status
    let registeredStatusHandlers = [];
    let currentStatus = 'idle';
      
    // while downloading
    let blockingPromises;
      
    // The update info
    let currentUpdateApplyHandlers;
    let queuedInvalidatedModules;
      
    __webpack_require__.hmrD = currentModuleData;
    
    if (hot) {
      __webpack_require__.i.push(function (options) {
        let module = options.module;
        let require = createRequire(options.require, options.id);
        module.hot = createModuleHotObject(options.id, module);
        module.parents = currentParents;
        module.children = [];
        currentParents = [];
        options.require = require;
      });
    }

    __webpack_require__.hmrC = {};
    __webpack_require__.hmrI = {};
      
    function createRequire(require, moduleId) {
      let me = installedModules[moduleId];
      if (!me) return require;
      let fn = function (request) {
        if (me.hot.active) {
          if (installedModules[request]) {
            let parents = installedModules[request].parents;
            if (parents.indexOf(moduleId) === -1) {
              parents.push(moduleId);
            }
          } else {
            currentParents = [moduleId];
            currentChildModule = request;
          }
          if (me.children.indexOf(request) === -1) {
            me.children.push(request);
          }
        } else {
          console.warn(
            '[HMR] unexpected require('
                + request
                + ') from disposed module '
                + moduleId
          );
          currentParents = [];
        }
        return require(request);
      };
      let createPropertyDescriptor = function (name) {
        return {
          configurable: true,
          enumerable: true,
          get() {
            return require[name];
          },
          set(value) {
            require[name] = value;
          }
        };
      };
      for (let name in require) {
        if (Object.prototype.hasOwnProperty.call(require, name) && name !== 'e') {
          Object.defineProperty(fn, name, createPropertyDescriptor(name));
        }
      }
      fn.e = function (chunkId) {
        return trackBlockingPromise(require.e(chunkId));
      };
      return fn;
    }
      
    function createModuleHotObject(moduleId, me) {
      let hot = {
      // private stuff
        _acceptedDependencies: {},
        _declinedDependencies: {},
        _selfAccepted: false,
        _selfDeclined: false,
        _selfInvalidated: false,
        _disposeHandlers: [],
        _main: currentChildModule !== moduleId,
        _requireSelf() {
          currentParents = me.parents.slice();
          currentChildModule = moduleId;
          __webpack_require__(moduleId);
        },
      
        // Module API
        active: true,
        accept(dep, callback) {
          if (dep === undefined) hot._selfAccepted = true;
          else if (typeof dep === 'function') hot._selfAccepted = dep;
          else if (typeof dep === 'object' && dep !== null) {
            for (let i = 0; i < dep.length; i++) hot._acceptedDependencies[dep[i]] = callback || function () {};
          } else hot._acceptedDependencies[dep] = callback || function () {};
        },
        decline(dep) {
          if (dep === undefined) hot._selfDeclined = true;
          else if (typeof dep === 'object' && dep !== null) for (let i = 0; i < dep.length; i++) hot._declinedDependencies[dep[i]] = true;
          else hot._declinedDependencies[dep] = true;
        },
        dispose(callback) {
          hot._disposeHandlers.push(callback);
        },
        addDisposeHandler(callback) {
          hot._disposeHandlers.push(callback);
        },
        removeDisposeHandler(callback) {
          let idx = hot._disposeHandlers.indexOf(callback);
          if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
        },
        invalidate() {
          this._selfInvalidated = true;
          switch (currentStatus) {
            case 'idle':
              currentUpdateApplyHandlers = [];
              Object.keys(__webpack_require__.hmrI).forEach(function (key) {
                __webpack_require__.hmrI[key](
                  moduleId,
                  currentUpdateApplyHandlers
                );
              });
              setStatus('ready');
              break;
            case 'ready':
              Object.keys(__webpack_require__.hmrI).forEach(function (key) {
                __webpack_require__.hmrI[key](
                  moduleId,
                  currentUpdateApplyHandlers
                );
              });
              break;
            case 'prepare':
            case 'check':
            case 'dispose':
            case 'apply':
              (queuedInvalidatedModules = queuedInvalidatedModules || []).push(
                moduleId
              );
              break;
            default:
            // ignore requests in error states
              break;
          }
        },
      
        // Management API
        check: hotCheck,
        apply: hotApply,
        status(l) {
          if (!l) return currentStatus;
          registeredStatusHandlers.push(l);
        },
        addStatusHandler(l) {
          registeredStatusHandlers.push(l);
        },
        removeStatusHandler(l) {
          let idx = registeredStatusHandlers.indexOf(l);
          if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
        },
      
        // inherit from previous dispose call
        data: currentModuleData[moduleId]
      };
      currentChildModule = undefined;
      return hot;
    }
      
    function setStatus(newStatus) {
      currentStatus = newStatus;
      for (let i = 0; i < registeredStatusHandlers.length; i++) registeredStatusHandlers[i].call(null, newStatus);
    }
      
    function trackBlockingPromise(promise) {
      switch (currentStatus) {
        case 'ready':
          setStatus('prepare');
          blockingPromises.push(promise);
          waitForBlockingPromises(function () {
            setStatus('ready');
          });
          return promise;
        case 'prepare':
          blockingPromises.push(promise);
          return promise;
        default:
          return promise;
      }
    }
      
    function waitForBlockingPromises(fn) {
      if (blockingPromises.length === 0) return fn();
      let blocker = blockingPromises;
      blockingPromises = [];
      return Promise.all(blocker).then(function () {
        return waitForBlockingPromises(fn);
      });
    }
      
    function hotCheck(applyOnUpdate) {
      if (currentStatus !== 'idle') {
        throw new Error('check() is only allowed in idle status');
      }
      setStatus('check');
      return __webpack_require__.hmrM().then(function (update) {
        if (!update) {
          setStatus(applyInvalidatedModules() ? 'ready' : 'idle');
          return null;
        }
      
        setStatus('prepare');

        let updatedModules = [];
        blockingPromises = [];
        currentUpdateApplyHandlers = [];
      
        return Promise.all(
          Object.keys(__webpack_require__.hmrC).reduce(function (
            promises,
            key
          ) {
            __webpack_require__.hmrC[key](
              update.c,
              update.r,
              update.m,
              promises,
              currentUpdateApplyHandlers,
              updatedModules
            );
            return promises;
          },
          [])
        ).then(function () {
          return waitForBlockingPromises(function () {
            if (applyOnUpdate) {
              return internalApply(applyOnUpdate);
            } 
            setStatus('ready');
      
            return updatedModules;
          });
        });
      });
    }
      
    function hotApply(options) {
      if (currentStatus !== 'ready') {
        return Promise.resolve().then(function () {
          throw new Error('apply() is only allowed in ready status');
        });
      }
      return internalApply(options);
    }
      
    function internalApply(options) {
      options = options || {};
      
      applyInvalidatedModules();
      
      let results = currentUpdateApplyHandlers.map(function (handler) {
        return handler(options);
      });
      currentUpdateApplyHandlers = undefined;
      
      let errors = results
        .map(function (r) {
          return r.error;
        })
        .filter(Boolean);
      
      if (errors.length > 0) {
        setStatus('abort');
        return Promise.resolve().then(function () {
          throw errors[0];
        });
      }
      
      // Now in "dispose" phase
      setStatus('dispose');
      
      results.forEach(function (result) {
        if (result.dispose) result.dispose();
      });
      
      // Now in "apply" phase
      setStatus('apply');
      
      let error;
      let reportError = function (err) {
        if (!error) error = err;
      };
      
      let outdatedModules = [];
      results.forEach(function (result) {
        if (result.apply) {
          let modules = result.apply(reportError);
          if (modules) {
            for (let i = 0; i < modules.length; i++) {
              outdatedModules.push(modules[i]);
            }
          }
        }
      });
      
      // handle errors in accept handlers and self accepted module load
      if (error) {
        setStatus('fail');
        return Promise.resolve().then(function () {
          throw error;
        });
      }
      
      if (queuedInvalidatedModules) {
        return internalApply(options).then(function (list) {
          outdatedModules.forEach(function (moduleId) {
            if (list.indexOf(moduleId) < 0) list.push(moduleId);
          });
          return list;
        });
      }
      
      setStatus('idle');
      return Promise.resolve(outdatedModules);
    }
      
    function applyInvalidatedModules() {
      if (queuedInvalidatedModules) {
        if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
        Object.keys(__webpack_require__.hmrI).forEach(function (key) {
          queuedInvalidatedModules.forEach(function (moduleId) {
            __webpack_require__.hmrI[key](
              moduleId,
              currentUpdateApplyHandlers
            );
          });
        });
        queuedInvalidatedModules = undefined;
        return true;
      }
    }
  })();
    
  /* webpack/runtime/publicPath */
  __webpack_require__.p = joinUrl(host, publicPath);
    
  /* webpack/runtime/consumes */
  (() => {
    let ensureExistence = (scopeName, key) => {
      let scope = __webpack_require__.S[scopeName];
      if (!scope || !__webpack_require__.o(scope, key)) throw new Error('Shared module ' + key + " doesn't exist in shared scope " + scopeName);
      return scope;
    };
    let findVersion = (scope, key) => {
      let versions = scope[key];
      key = Object.keys(versions).reduce((a, b) => (!a || versionLt(a, b) ? b : a), 0);
      return key && versions[key];
    };
    let findSingletonVersionKey = (scope, key) => {
      let versions = scope[key];
      return Object.keys(versions).reduce((a, b) => (!a || (!versions[a].loaded && versionLt(a, b)) ? b : a), 0);
    };
    let get = entry => {
      entry.loaded = 1;
      return entry.get();
    };
    // eslint-disable-next-line max-len
    let getInvalidSingletonVersionMessage = (key, version, requiredVersion) => 'Unsatisfied version ' + version + ' of shared singleton module ' + key + ' (required ' + rangeToString(requiredVersion) + ')';
    let getSingletonVersion = (scope, scopeName, key, requiredVersion) => {
      let version = findSingletonVersionKey(scope, key);
      if (!satisfy(requiredVersion, version)) {
        typeof console !== 'undefined' && console.warn && console.warn(getInvalidSingletonVersionMessage(key, version, requiredVersion));
      }
      return get(scope[key][version]);
    };
    let getStrictSingletonVersion = (scope, scopeName, key, requiredVersion) => {
      let version = findSingletonVersionKey(scope, key);
      if (!satisfy(requiredVersion, version)) throw new Error(getInvalidSingletonVersionMessage(key, version, requiredVersion));
      return get(scope[key][version]);
    };
    let findValidVersion = (scope, key, requiredVersion) => {
      let versions = scope[key];
      key = Object.keys(versions).reduce((a, b) => {
        if (!satisfy(requiredVersion, b)) return a;
        return !a || versionLt(a, b) ? b : a;
      }, 0);
      return key && versions[key];
    };
    let getInvalidVersionMessage = (scope, scopeName, key, requiredVersion) => {
      let versions = scope[key];
      return 'No satisfying version (' + rangeToString(requiredVersion) + ') of shared module ' + key + ' found in shared scope ' + scopeName + '.\n'
          + 'Available versions: ' + Object.keys(versions).map(key => key + ' from ' + versions[key].from).join(', ');
    };
    let getValidVersion = (scope, scopeName, key, requiredVersion) => {
      let entry = findValidVersion(scope, key, requiredVersion);
      if (entry) return get(entry);
      throw new Error(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));
    };
    let warnInvalidVersion = (scope, scopeName, key, requiredVersion) => {
      typeof console !== 'undefined' && console.warn && console.warn(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));
    };
    let init = fn => function (scopeName, a, b, c) {
      let promise = __webpack_require__.I(scopeName);
      if (promise && promise.then) return promise.then(fn.bind(fn, scopeName, __webpack_require__.S[scopeName], a, b, c));
      return fn(scopeName, __webpack_require__.S[scopeName], a, b, c);
    };
      
    // eslint-disable-next-line no-unused-vars
    let load = /* #__PURE__ */ init((scopeName, scope, key) => {
      ensureExistence(scopeName, key);
      return get(findVersion(scope, key));
    });
    // eslint-disable-next-line no-unused-vars
    let loadFallback = /* #__PURE__ */ init((scopeName, scope, key, fallback) => 
      (scope && __webpack_require__.o(scope, key) ? get(findVersion(scope, key)) : fallback()));
    // eslint-disable-next-line no-unused-vars
    let loadVersionCheck = /* #__PURE__ */ init((scopeName, scope, key, version) => {
      ensureExistence(scopeName, key);
      return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
    });
    // eslint-disable-next-line no-unused-vars
    let loadSingletonVersionCheck = /* #__PURE__ */ init((scopeName, scope, key, version) => {
      ensureExistence(scopeName, key);
      return getSingletonVersion(scope, scopeName, key, version);
    });
    // eslint-disable-next-line no-unused-vars
    let loadStrictVersionCheck = /* #__PURE__ */ init((scopeName, scope, key, version) => {
      ensureExistence(scopeName, key);
      return getValidVersion(scope, scopeName, key, version);
    });
    // eslint-disable-next-line no-unused-vars
    let loadStrictSingletonVersionCheck = /* #__PURE__ */ init((scopeName, scope, key, version) => {
      ensureExistence(scopeName, key);
      return getStrictSingletonVersion(scope, scopeName, key, version);
    });
    // eslint-disable-next-line no-unused-vars
    let loadVersionCheckFallback = /* #__PURE__ */ init((scopeName, scope, key, version, fallback) => {
      if (!scope || !__webpack_require__.o(scope, key)) return fallback();
      return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
    });
    let loadSingletonVersionCheckFallback = /* #__PURE__ */ init((scopeName, scope, key, version, fallback) => {
      if (!scope || !__webpack_require__.o(scope, key)) return fallback();
      return getSingletonVersion(scope, scopeName, key, version);
    });
    // eslint-disable-next-line no-unused-vars
    let loadStrictVersionCheckFallback = /* #__PURE__ */ init((scopeName, scope, key, version, fallback) => {
      let entry = scope && __webpack_require__.o(scope, key) && findValidVersion(scope, key, version);
      return entry ? get(entry) : fallback();
    });
    // eslint-disable-next-line no-unused-vars
    let loadStrictSingletonVersionCheckFallback = /* #__PURE__ */ init((scopeName, scope, key, version, fallback) => {
      if (!scope || !__webpack_require__.o(scope, key)) return fallback();
      return getStrictSingletonVersion(scope, scopeName, key, version);
    });
    let installedModules = {};
    let moduleToHandlerMapping = {};
    Object.keys(remotes.moduleIdToSourceMapping || {}).forEach(id => {
      let [shareScope, shareKey, version, chunkIds, entryId] = remotes.moduleIdToSourceMapping[id];
      moduleToHandlerMapping[id] = () => loadSingletonVersionCheckFallback(
        shareScope, 
        shareKey, 
        version, 
        () => Promise.all(chunkIds.map(chunkId => __webpack_require__.e(chunkId)))
          .then(() => () => __webpack_require__(entryId))
      );
    });

    let initialConsumes = remotes.initialConsumes || [];
    initialConsumes.forEach(id => {
      __webpack_modules__[id] = module => {
        // Handle case when module is used sync
        installedModules[id] = 0;
        delete __webpack_module_cache__[id];
        let factory = moduleToHandlerMapping[id]();
        if (typeof factory !== 'function') throw new Error('Shared module is not available for eager consumption: ' + id);
        module.exports = factory();
      };
    });

    let chunkMapping = remotes.chunkToModuleMapping || {};
    __webpack_require__.f.consumes = (chunkId, promises) => {
      if (__webpack_require__.o(chunkMapping, chunkId)) {
        chunkMapping[chunkId].forEach(id => {
          if (__webpack_require__.o(installedModules, id)) return promises.push(installedModules[id]);
          let onFactory = factory => {
            installedModules[id] = 0;
            __webpack_modules__[id] = module => {
              delete __webpack_module_cache__[id];
              module.exports = factory();
            };
          };
          let onError = error => {
            delete installedModules[id];
            __webpack_modules__[id] = module => {
              delete __webpack_module_cache__[id];
              throw error;
            };
          };
          try {
            let promise = moduleToHandlerMapping[id]();
            if (promise.then) {
              promises.push(installedModules[id] = promise.then(onFactory).catch(onError));
            } else onFactory(promise);
          } catch (e) { onError(e); }
        });
      }
    };
  })();
    
  /* webpack/runtime/css loading */
  (() => {
    let installedCssChunks = {};

    let loadStylesheet = chunkId => {
      let href = __webpack_require__.miniCssF(chunkId);
      return new Promise((resolve, reject) => {
        if (!href) return resolve();
        href = __webpack_require__.p + href;

        importCss(href, { 
          timeout, 
          head: context.__windowProxy__.doc.head, 
          scopeName, 
          host,
          devtool,
          beforeSource,
          cached
        }).then(resolve).catch(function (err) {
          delete installedCssChunks[chunkId];
          reject(err);
        });
      });
    };

    __webpack_require__.f.miniCss = (chunkId, promises) => {
      if (installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);
      else if (installedCssChunks[chunkId] !== 0) {
        promises.push(installedCssChunks[chunkId] = loadStylesheet(chunkId).then(() => {
          installedCssChunks[chunkId] = 0;
        }, e => {
          delete installedCssChunks[chunkId];
          throw e;
        }));
      }
    };
    __webpack_require__.hmrC.miniCss = (chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList) => {
      chunkIds.forEach(chunkId => promises.push(loadStylesheet(chunkId)));
    };
  })();
    
  /* webpack/runtime/jsonp chunk loading */

  if (remotes.withBaseURI) __webpack_require__.b = document.baseURI || self.location.href;
      
  // object to store loaded and loading chunks
  // undefined = chunk not loaded, null = chunk preloaded/prefetched
  // Promise = chunk loading, 0 = chunk loaded
  let installedChunks = {};
  let deferredModules = [];

  __webpack_require__.f.j = (chunkId, promises) => {
    // JSONP chunk loading for javascript
    let installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
    if (installedChunkData !== 0) { // 0 means "already installed".
      // a Promise means "currently loading".
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        if (hasJsMatcher(chunkId)) {
          // setup Promise in chunk cache
          let promise = new Promise((resolve, reject) => {
            installedChunkData = installedChunks[chunkId] = [resolve, reject];
          });
          promises.push(installedChunkData[2] = promise);
      
          // start chunk loading
          let url = __webpack_require__.u(chunkId);
          if (Array.isArray(url)) url = url.map(u => __webpack_require__.p + u);
          else url = __webpack_require__.p + url;
          // create error before stack unwound to get useful stacktrace later
          let loadingEnded = event => {
            if (__webpack_require__.o(installedChunks, chunkId)) {
              installedChunkData = installedChunks[chunkId];
              if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
              if (installedChunkData) {
                let errorType = event && (event.type === 'load' ? 'missing' : event.type);
                let realSrc = event && event.target && event.target.src;
                let error = new Error();
                error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
                error.name = 'ChunkLoadError';
                error.type = errorType;
                error.request = realSrc;
                installedChunkData[1](error);
              }
            }
          };
          __webpack_require__.l(url, loadingEnded, 'chunk-' + chunkId);
        } else installedChunks[chunkId] = 0;
      }
    }
  };

  const hasJsMatcher = webpackVersion <= 5
    ? chunkId => jsChunks[chunkId]
    : typeof remotes.hasJsMatcher === 'string'
      ? chunkId => !(new RegExp(remotes.hasJsMatcher).test(chunkId))
      : () => remotes.hasJsMatcher == null || remotes.hasJsMatcher;
      
  let currentUpdatedModulesList;
  let waitingUpdateResolves = {};
  function loadUpdateChunk(chunkId) {
    return new Promise((resolve, reject) => {
      waitingUpdateResolves[chunkId] = resolve;
      // start update chunk loading
      let url = __webpack_require__.p + __webpack_require__.hu(chunkId);
      // create error before stack unwound to get useful stacktrace later
      let error = new Error();
      let loadingEnded = event => {
        if (waitingUpdateResolves[chunkId]) {
          waitingUpdateResolves[chunkId] = undefined;
          let errorType = event && (event.type === 'load' ? 'missing' : event.type);
          let realSrc = event && event.target && event.target.src;
          error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
          error.name = 'ChunkLoadError';
          error.type = errorType;
          error.request = realSrc;
          reject(error);
        }
      };
      __webpack_require__.l(url, loadingEnded);
    });
  }

  let currentUpdate;
  let currentUpdateChunks;
  let currentUpdateRemovedChunks;
  let currentUpdateRuntime;

  context[hotUpdateGlobal || 'webpackHotUpdate'] = (chunkId, moreModules, runtime) => {
    if (currentUpdate) {
      for (let moduleId in moreModules) {
        if (__webpack_require__.o(moreModules, moduleId)) {
          currentUpdate[moduleId] = moreModules[moduleId];
          if (currentUpdatedModulesList) currentUpdatedModulesList.push(moduleId);
        }
      }
    }
    if (runtime) currentUpdateRuntime.push(runtime);
    if (waitingUpdateResolves[chunkId]) {
      waitingUpdateResolves[chunkId]();
      waitingUpdateResolves[chunkId] = undefined;
    }
  };
      

  function applyHandler(options) {
    if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr;
    currentUpdateChunks = undefined;
    function getAffectedModuleEffects(updateModuleId) {
      let outdatedModules = [updateModuleId];
      let outdatedDependencies = {};
      
      let queue = outdatedModules.map(function (id) {
        return {
          chain: [id],
          id
        };
      });
      while (queue.length > 0) {
        let queueItem = queue.pop();
        let moduleId = queueItem.id;
        let chain = queueItem.chain;
        let module = __webpack_require__.c[moduleId];
        if (
          !module
              || (module.hot._selfAccepted && !module.hot._selfInvalidated)
        ) continue;
        if (module.hot._selfDeclined) {
          return {
            type: 'self-declined',
            chain,
            moduleId
          };
        }
        if (module.hot._main) {
          return {
            type: 'unaccepted',
            chain,
            moduleId
          };
        }
        for (let i = 0; i < module.parents.length; i++) {
          let parentId = module.parents[i];
          let parent = __webpack_require__.c[parentId];
          if (!parent) continue;
          if (parent.hot._declinedDependencies[moduleId]) {
            return {
              type: 'declined',
              chain: chain.concat([parentId]),
              moduleId,
              parentId
            };
          }
          if (outdatedModules.indexOf(parentId) !== -1) continue;
          if (parent.hot._acceptedDependencies[moduleId]) {
            if (!outdatedDependencies[parentId]) outdatedDependencies[parentId] = [];
            addAllToSet(outdatedDependencies[parentId], [moduleId]);
            continue;
          }
          delete outdatedDependencies[parentId];
          outdatedModules.push(parentId);
          queue.push({
            chain: chain.concat([parentId]),
            id: parentId
          });
        }
      }
      
      return {
        type: 'accepted',
        moduleId: updateModuleId,
        outdatedModules,
        outdatedDependencies
      };
    }
      
    function addAllToSet(a, b) {
      for (let i = 0; i < b.length; i++) {
        let item = b[i];
        if (a.indexOf(item) === -1) a.push(item);
      }
    }
      
    // at begin all updates modules are outdated
    // the "outdated" status can propagate to parents if they don't accept the children
    let outdatedDependencies = {};
    let outdatedModules = [];
    let appliedUpdate = {};
      
    let warnUnexpectedRequire = function warnUnexpectedRequire(module) {
      console.warn(
        '[HMR] unexpected require(' + module.id + ') to disposed module'
      );
    };
      
    for (let moduleId in currentUpdate) {
      if (__webpack_require__.o(currentUpdate, moduleId)) {
        let newModuleFactory = currentUpdate[moduleId];
        let result;
        if (newModuleFactory) {
          result = getAffectedModuleEffects(moduleId);
        } else {
          result = {
            type: 'disposed',
            moduleId
          };
        }
        /** @type {Error|false} */
        let abortError = false;
        let doApply = false;
        let doDispose = false;
        let chainInfo = '';
        if (result.chain) {
          chainInfo = '\nUpdate propagation: ' + result.chain.join(' -> ');
        }
        switch (result.type) {
          case 'self-declined':
            if (options.onDeclined) options.onDeclined(result);
            if (!options.ignoreDeclined) abortError = new Error(
              'Aborted because of self decline: '
                      + result.moduleId
                      + chainInfo
            );
            break;
          case 'declined':
            if (options.onDeclined) options.onDeclined(result);
            if (!options.ignoreDeclined) abortError = new Error(
              'Aborted because of declined dependency: '
                      + result.moduleId
                      + ' in '
                      + result.parentId
                      + chainInfo
            );
            break;
          case 'unaccepted':
            if (options.onUnaccepted) options.onUnaccepted(result);
            if (!options.ignoreUnaccepted) abortError = new Error(
              'Aborted because ' + moduleId + ' is not accepted' + chainInfo
            );
            break;
          case 'accepted':
            if (options.onAccepted) options.onAccepted(result);
            doApply = true;
            break;
          case 'disposed':
            if (options.onDisposed) options.onDisposed(result);
            doDispose = true;
            break;
          default:
            throw new Error('Unexception type ' + result.type);
        }
        if (abortError) {
          return {
            error: abortError
          };
        }
        if (doApply) {
          appliedUpdate[moduleId] = newModuleFactory;
          addAllToSet(outdatedModules, result.outdatedModules);
          for (moduleId in result.outdatedDependencies) {
            if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
              if (!outdatedDependencies[moduleId]) outdatedDependencies[moduleId] = [];
              addAllToSet(
                outdatedDependencies[moduleId],
                result.outdatedDependencies[moduleId]
              );
            }
          }
        }
        if (doDispose) {
          addAllToSet(outdatedModules, [result.moduleId]);
          appliedUpdate[moduleId] = warnUnexpectedRequire;
        }
      }
    }
    currentUpdate = undefined;
      
    // Store self accepted outdated modules to require them later by the module system
    let outdatedSelfAcceptedModules = [];
    for (let j = 0; j < outdatedModules.length; j++) {
      let outdatedModuleId = outdatedModules[j];
      if (
        __webpack_require__.c[outdatedModuleId]
            && __webpack_require__.c[outdatedModuleId].hot._selfAccepted
            // removed self-accepted modules should not be required
            && appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire
            // when called invalidate self-accepting is not possible
            && !__webpack_require__.c[outdatedModuleId].hot._selfInvalidated
      ) {
        outdatedSelfAcceptedModules.push({
          module: outdatedModuleId,
          require: __webpack_require__.c[outdatedModuleId].hot._requireSelf,
          errorHandler: __webpack_require__.c[outdatedModuleId].hot._selfAccepted
        });
      }
    }
      
    let moduleOutdatedDependencies;
      
    return {
      dispose() {
        currentUpdateRemovedChunks.forEach(function (chunkId) {
          delete installedChunks[chunkId];
        });
        currentUpdateRemovedChunks = undefined;
      
        let idx;
        let module;
        let queue = outdatedModules.slice();
        while (queue.length > 0) {
          let moduleId = queue.pop();
          module = __webpack_require__.c[moduleId];
          if (!module) continue;
      
          let data = {};
      
          // Call dispose handlers
          let disposeHandlers = module.hot._disposeHandlers;
          for (let j = 0; j < disposeHandlers.length; j++) {
            disposeHandlers[j].call(null, data);
          }
          __webpack_require__.hmrD[moduleId] = data;
      
          // disable module (this disables requires from this module)
          module.hot.active = false;
      
          // remove module from cache
          delete __webpack_require__.c[moduleId];
      
          // when disposing there is no need to call dispose handler
          delete outdatedDependencies[moduleId];
      
          // remove "parents" references from all children
          for (let j = 0; j < module.children.length; j++) {
            let child = __webpack_require__.c[module.children[j]];
            if (!child) continue;
            idx = child.parents.indexOf(moduleId);
            if (idx >= 0) {
              child.parents.splice(idx, 1);
            }
          }
        }
      
        // remove outdated dependency from module children
        let dependency;
        for (let outdatedModuleId in outdatedDependencies) {
          if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
            module = __webpack_require__.c[outdatedModuleId];
            if (module) {
              moduleOutdatedDependencies = outdatedDependencies[outdatedModuleId];
              for (let j = 0; j < moduleOutdatedDependencies.length; j++) {
                dependency = moduleOutdatedDependencies[j];
                idx = module.children.indexOf(dependency);
                if (idx >= 0) module.children.splice(idx, 1);
              }
            }
          }
        }
      },
      apply(reportError) {
        // insert new code
        for (let updateModuleId in appliedUpdate) {
          if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
            __webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
          }
        }
      
        // run new runtime modules
        for (let i = 0; i < currentUpdateRuntime.length; i++) {
          currentUpdateRuntime[i](__webpack_require__);
        }
      
        // call accept handlers
        for (let outdatedModuleId in outdatedDependencies) {
          if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
            let module = __webpack_require__.c[outdatedModuleId];
            if (module) {
              moduleOutdatedDependencies
                    = outdatedDependencies[outdatedModuleId];
              let callbacks = [];
              let dependenciesForCallbacks = [];
              for (let j = 0; j < moduleOutdatedDependencies.length; j++) {
                let dependency = moduleOutdatedDependencies[j];
                let acceptCallback
                      = module.hot._acceptedDependencies[dependency];
                if (acceptCallback) {
                  if (callbacks.indexOf(acceptCallback) !== -1) continue;
                  callbacks.push(acceptCallback);
                  dependenciesForCallbacks.push(dependency);
                }
              }
              for (let k = 0; k < callbacks.length; k++) {
                try {
                  callbacks[k].call(null, moduleOutdatedDependencies);
                } catch (err) {
                  if (options.onErrored) {
                    options.onErrored({
                      type: 'accept-errored',
                      moduleId: outdatedModuleId,
                      dependencyId: dependenciesForCallbacks[k],
                      error: err
                    });
                  }
                  if (!options.ignoreErrored) {
                    reportError(err);
                  }
                }
              }
            }
          }
        }
      
        // Load self accepted modules
        for (let o = 0; o < outdatedSelfAcceptedModules.length; o++) {
          let item = outdatedSelfAcceptedModules[o];
          let moduleId = item.module;
          try {
            item.require(moduleId);
          } catch (err) {
            if (typeof item.errorHandler === 'function') {
              try {
                item.errorHandler(err);
              } catch (err2) {
                if (options.onErrored) {
                  options.onErrored({
                    type: 'self-accept-error-handler-errored',
                    moduleId,
                    error: err2,
                    originalError: err
                  });
                }
                if (!options.ignoreErrored) {
                  reportError(err2);
                }
                reportError(err);
              }
            } else {
              if (options.onErrored) {
                options.onErrored({
                  type: 'self-accept-errored',
                  moduleId,
                  error: err
                });
              }
              if (!options.ignoreErrored) {
                reportError(err);
              }
            }
          }
        }
      
        return outdatedModules;
      }
    };
  }
  __webpack_require__.hmrI.jsonp = function (moduleId, applyHandlers) {
    if (!currentUpdate) {
      currentUpdate = {};
      currentUpdateRuntime = [];
      currentUpdateRemovedChunks = [];
      applyHandlers.push(applyHandler);
    }
    if (!__webpack_require__.o(currentUpdate, moduleId)) {
      currentUpdate[moduleId] = __webpack_require__.m[moduleId];
    }
  };
  __webpack_require__.hmrC.jsonp = function (
    chunkIds,
    removedChunks,
    removedModules,
    promises,
    applyHandlers,
    updatedModulesList
  ) {
    applyHandlers.push(applyHandler);
    currentUpdateChunks = {};
    currentUpdateRemovedChunks = removedChunks;
    currentUpdate = removedModules.reduce(function (obj, key) {
      obj[key] = false;
      return obj;
    }, {});
    currentUpdateRuntime = [];
    chunkIds.forEach(function (chunkId) {
      if (
        __webpack_require__.o(installedChunks, chunkId)
            && installedChunks[chunkId] !== undefined
      ) {
        promises.push(loadUpdateChunk(chunkId, updatedModulesList));
        currentUpdateChunks[chunkId] = true;
      }
    });
    if (__webpack_require__.f) {
      __webpack_require__.f.jsonpHmr = function (chunkId, promises) {
        if (
          currentUpdateChunks
              && !__webpack_require__.o(currentUpdateChunks, chunkId)
              && __webpack_require__.o(installedChunks, chunkId)
              && installedChunks[chunkId] !== undefined
        ) {
          promises.push(loadUpdateChunk(chunkId));
          currentUpdateChunks[chunkId] = true;
        }
      };
    }
  };
      
  __webpack_require__.hmrM = requestTimeout => {
    requestTimeout = requestTimeout || 10000;
    return new Promise(async function (resolve, reject) {
      const requestPath = __webpack_require__.p + __webpack_require__.hmrF();
      try {
        let update = JSON.parse(await fetch(requestPath, { timeout: requestTimeout }));
        resolve(webpackVersion >= 5 ? update : undefined);
      } catch (e) {
        if (e && e.xhr && e.xhr.status === 404) return resolve();
        reject(e);
      }
    });
  };
      
  let checkDeferredModules = () => {
      
  };
  function checkDeferredModulesImpl() {
    let result;
    for (let i = 0; i < deferredModules.length; i++) {
      let deferredModule = deferredModules[i];
      let fulfilled = true;
      for (let j = 1; j < deferredModule.length; j++) {
        let depId = deferredModule[j];
        if (installedChunks[depId] !== 0) fulfilled = false;
      }
      if (fulfilled) {
        deferredModules.splice(i--, 1);
        result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
      }
    }
    if (deferredModules.length === 0) {
      __webpack_require__.x();
      __webpack_require__.x = () => {
      
      };
    }
    return result;
  }

  // install a JSONP callback for chunk loading
  function webpackJsonpCallback(data) {
    let [chunkIds, moreModules, runtime, executeModules] = data;
    if (webpackVersion < 5) {
      executeModules = runtime;
      runtime = undefined;
    }
    // add "moreModules" to the modules object,
    // then flag all "chunkIds" as loaded and fire callback
    let moduleId; let chunkId; 
    let i = 0; 
    let resolves = [];
    for (;i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
        resolves.push(installedChunks[chunkId][0]);
      }
      installedChunks[chunkId] = 0;
    }
    for (moduleId in moreModules) {
      if (__webpack_require__.o(moreModules, moduleId) 
        && !__webpack_require__.o(__webpack_require__.m, moduleId)) {
        __webpack_require__.m[moduleId] = moreModules[moduleId];
      }
    }
    if (runtime) runtime(__webpack_require__);
    parentChunkLoadingFunction(data);
    while (resolves.length) {
      resolves.shift()();
    }
      
    // add entry modules from loaded chunk to deferred list
    if (executeModules) deferredModules.push.apply(deferredModules, executeModules);
      
    // run deferred modules when all chunks ready
    return checkDeferredModules();
  }
    
  /** ********************************************************************* */
  // module cache are used so entry inlining is disabled
  // run startup
  // reset startup function so it can be called again when more startup code is added
  __webpack_require__.x = () => {};
  chunkLoadingGlobal = chunkLoadingGlobal.slice();
  for (let i = 0; i < chunkLoadingGlobal.length; i++) webpackJsonpCallback(chunkLoadingGlobal[i]);
  (checkDeferredModules = checkDeferredModulesImpl)();

  return __webpack_require__;
}

export default createRuntime;