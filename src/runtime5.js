
/* eslint-disable camelcase */
import fetch, { globalCached, objectDefineProperty } from './fetch';
import { DEFAULT_TIMEOUT, isFunction, joinUrl, innumerable } from './utils';
import importCss from './importCss';
import importJs from './importJs';
import jsonp from './jsonp';
import { versionLt, rangeToString, satisfy } from './semver';

function createRuntime(options = {}) {
  const {
    jsonpFunction = 'webpackJsonp',
    publicPath = '',
    host = '',
    devtool = false,
    cacheDB,
    hot,
    hash = '',
    uniqueName = '',
    scopeName = '',
    hotUpdateGlobal = '',
    sourcemapHost = '',
    cssChunks = {},
    jsChunks = {},
    context = {},
    sync = false,
    webpackVersion = 4,
    timeout = DEFAULT_TIMEOUT,
    requireExternal,
    beforeSource,
    remotes = {}
  } = options;

  /**
   * @type {{
   *  _js?: Record<string, Promise<any>>,
   *  _css?: Record<string, Promise<HTMLStyleElement>>,
   * }}
   * */
  let __webpack_chunk_cache__ = {};

  let __webpack_modules__ = {};
  let __webpack_module_cache__ = {};

  if (!context[jsonpFunction]) innumerable(context, jsonpFunction, []);


  let chunkLoadingGlobal = context[jsonpFunction] = context[jsonpFunction] || [];
  chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));

  if (webpackVersion > 4 && remotes.loading
    && options.cached === globalCached && !self[jsonpFunction]) self[jsonpFunction] = chunkLoadingGlobal;

  // The require function
  function __webpack_require__(moduleId, entryFile) {
    if (Array.isArray(moduleId)) return moduleId.map((id, i) => __webpack_require__(id, entryFile[i]));
    // Check if module is in cache
    let cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      if (cachedModule.error !== undefined) throw cachedModule.error;
      return cachedModule.exports;
    }
    if (!__webpack_modules__[moduleId] && entryFile && __webpack_modules__[entryFile]) moduleId = entryFile;
    if (!__webpack_modules__[moduleId]) {
      let result;
      result = requireExternal(moduleId);
      if (result === undefined) console.error(`[import-remote]module[${moduleId}] not exist!`);
      return result;
    }
    // Create a new module (and put it into the cache)
    let module = __webpack_module_cache__[moduleId] = {
      inRemoteModule: true,
      requireExternal,
      resolveUrl: path => joinUrl(__webpack_require__.p, path),
      publicPath: __webpack_require__.p,
      id: moduleId,
      loaded: false,
      exports: {}
    };

    // Execute the module function
    try {
      let execOptions = { id: moduleId, module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
      __webpack_require__.i.forEach(function (handler) { handler(execOptions); });
      module = execOptions.module;
      execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
      // Flag the module as loaded
      if (Object.getOwnPropertyDescriptor(module, 'loaded').value !== undefined) {
        module.loaded = true;
      }
    } catch (e) {
      module.error = e;
      throw e;
    }

    // Return the exports of the module
    return module.exports;
  }

  /* webpack/runtime/publicPath */
  __webpack_require__.p = joinUrl(host, publicPath);

  // expose the modules object (__webpack_modules__)
  __webpack_require__.m = __webpack_modules__;

  // expose the module cache
  __webpack_require__.c = __webpack_module_cache__;
  __webpack_require__.c_ = __webpack_chunk_cache__;

  // expose the module execution interceptor
  __webpack_require__.i = [];

  /** ********************************************************************* */

  /* webpack/runtime/amd options */
  __webpack_require__.amdO = {};

  /* webpack/runtime/chunk loaded */
  (() => {
    let deferred = [];
    __webpack_require__.O = (result, chunkIds, fn, priority) => {
      if (chunkIds) {
        priority = priority || 0;
        let i;
        for (i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
        deferred[i] = [chunkIds, fn, priority];
        return;
      }
      let notFulfilled = Infinity;
      for (let i = 0; i < deferred.length; i++) {
        let [chunkIds, fn, priority] = deferred[i];
        let fulfilled = true;
        for (let j = 0; j < chunkIds.length; j++) {
          if ((priority & 1 === 0 || notFulfilled >= priority)
            && Object.keys(__webpack_require__.O).every(key => (__webpack_require__.O[key](chunkIds[j])))) {
            chunkIds.splice(j--, 1);
          } else {
            fulfilled = false;
            if (priority < notFulfilled) notFulfilled = priority;
          }
        }
        if (fulfilled) {
          deferred.splice(i--, 1);
          let r = fn();
          if (r !== undefined) result = r;
        }
      }
      return result;
    };

    __webpack_require__.O.j = chunkId => (installedChunks[chunkId] === 0);
  })();
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
  // eslint-disable-next-line no-proto
  let getProto = Object.getPrototypeOf ? obj => Object.getPrototypeOf(obj) : obj => obj.__proto__;
  let leafPrototypes;
  // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 16: return value when it's Promise-like
  // mode & 8|1: behave like require
  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = this(value);
    if (mode & 8) return value;
    if (typeof value === 'object' && value) {
      if ((mode & 4) && value.__esModule) return value;
      if ((mode & 16) && typeof value.then === 'function') return value;
    }
    let ns = Object.create(null);
    __webpack_require__.r(ns);
    let def = {};
    leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
    for (let current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
      Object.getOwnPropertyNames(current).forEach(key => def[key] = () => value[key]);
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
        objectDefineProperty(exports, definition, { enumerable: true, get: getter });
      }
      return;
    }

    for (let key in definition) {
      if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
        objectDefineProperty(exports, key, { enumerable: true, get: definition[key] });
      }
    }
  };

  /* webpack/runtime/ensure chunk */
  __webpack_require__.f = {};
  // This file contains only the entry chunk.
  // The chunk loading function for additional chunks
  __webpack_require__.e = (chunkId, isEntryId) => Promise.all(Object.keys(__webpack_require__.f)
    .reduce((promises, key) => {
      __webpack_require__.f[key](chunkId, promises, isEntryId);
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
  __webpack_require__.hmrF = () => (remotes.runtimeName ? remotes.runtimeName + '.' : '') + __webpack_require__.h() + '.hot-update.json';

  /* webpack/runtime/getFullHash */
  __webpack_require__.h = () => hash;

  /* webpack/runtime/harmony module decorator */
  __webpack_require__.hmd = module => {
    module = Object.create(module);
    if (!module.children) module.children = [];
    objectDefineProperty(module, 'exports', {
      enumerable: true,
      set: () => {
        throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
      }
    });
    return module;
  };

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
  __webpack_require__.l = (url, done, key, chunkId, isEntryId) => {
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
      cached: __webpack_chunk_cache__,
      cacheDB,
      scopeName,
      host,
      devtool,
      beforeSource,
      sourcemapHost,
      publicPath: __webpack_require__.p,
      sync: isEntryId && sync,
      key: key ? `${uniqueName}:${key}` : ''
    })))
      .then(onScriptComplete)
      .catch(onScriptComplete);
  };

  /* webpack/runtime/make namespace object */
  // define __esModule on exports
  __webpack_require__.r = exports => {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      objectDefineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    objectDefineProperty(exports, '__esModule', { value: true });
  };

  /* webpack/runtime/node module decorator */
  __webpack_require__.nmd = module => {
    module.paths = [];
    if (!module.children) module.children = [];
    return module;
  };

  /* webpack/runtime/react refresh */
  (() => {
    __webpack_require__.i.push(function (options) {
      let originalFactory = options.factory;
      options.factory = function (moduleObject, moduleExports, webpackRequire) {
        __webpack_require__.$Refresh$.setup(options.id);
        try {
          originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
        } finally {
          if (typeof Promise !== 'undefined' && moduleObject.exports instanceof Promise) {
            options.module.exports = options.module.exports.then(
              function (result) {
                __webpack_require__.$Refresh$.cleanup(options.id);
                return result;
              },
              function (reason) {
                __webpack_require__.$Refresh$.cleanup(options.id);
                return Promise.reject(reason);
              }
            );
          } else {
            __webpack_require__.$Refresh$.cleanup(options.id);
          }
        }
      };
    });

    __webpack_require__.$Refresh$ = {
      register() { return undefined; },
      signature() { return function (type) { return type; }; },
      runtime: {
        createSignatureFunctionForTransform() { return function (type) { return type; }; },
        register() { return undefined; }
      },
      setup(currentModuleId) {
        let prevModuleId = __webpack_require__.$Refresh$.moduleId;
        let prevRegister = __webpack_require__.$Refresh$.register;
        let prevSignature = __webpack_require__.$Refresh$.signature;
        let prevCleanup = __webpack_require__.$Refresh$.cleanup;

        __webpack_require__.$Refresh$.moduleId = currentModuleId;

        __webpack_require__.$Refresh$.register = function (type, id) {
          let typeId = currentModuleId + ' ' + id;
          __webpack_require__.$Refresh$.runtime.register(type, typeId);
        };

        __webpack_require__.$Refresh$.signature = function () { return __webpack_require__.$Refresh$.runtime.createSignatureFunctionForTransform(); };

        __webpack_require__.$Refresh$.cleanup = function (cleanupModuleId) {
          if (currentModuleId === cleanupModuleId) {
            __webpack_require__.$Refresh$.moduleId = prevModuleId;
            __webpack_require__.$Refresh$.register = prevRegister;
            __webpack_require__.$Refresh$.signature = prevSignature;
            __webpack_require__.$Refresh$.cleanup = prevCleanup;
          }
        };
      }
    };
  })();

  /* webpack fix load 'export default' module issue */
  // (() => {
  //   __webpack_require__.i.push(function (options) {
  //     let exports = options.module && options.module.exports;
  //     if (!exports || !isPlainObject(exports)) return;
  //     let keys = Object.keys(exports);
  //     if (keys.length === 1 && keys[0] === 'default') __webpack_require__.r(exports);
  //   });
  // })();

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
            let promise = isFunction(fn) ? fn(arg1, arg2) : fn;
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
            module.exports = isFunction(factory) ? factory() : factory;
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
      let register = (name, version, factory, loaded) => {
        let versions = scope[name] = scope[name] || {};
        let activeVersion = versions[version];
        if (!activeVersion || (!activeVersion.loaded && uniqueName > activeVersion.from)) {
          versions[version] = { get: factory, from: uniqueName, loaded };
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

      const initCode = (remotes.initCodePerScope && remotes.initCodePerScope[name]) || [];
      if (initCode) {
        initCode.forEach(item => {
          const [type] = item;
          if (type === 'register') {
            const [, shareKey, version, chunkIds, entryId] = item;
            let shareModule = __webpack_require__.m[entryId];
            if (shareModule && !shareModule.__import_remote_shared__ && !shareModule.__import_remote_external__) shareModule = null;
            register(shareKey, version, () => {
              if (shareModule) return shareModule;
              return Promise.all(chunkIds.map(id => __webpack_require__.e(id)))
                .then(() => () => __webpack_require__(entryId));
            }, shareModule ? 1 : 0);
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
          objectDefineProperty(fn, name, createPropertyDescriptor(name));
        }
      }
      fn.e = function (chunkId) {
        return trackBlockingPromise(require.e(chunkId));
      };
      return fn;
    }

    function createModuleHotObject(moduleId, me) {
      let _main = currentChildModule !== moduleId;
      let hot = {
      // private stuff
        _acceptedDependencies: {},
        _acceptedErrorHandlers: {},
        _declinedDependencies: {},
        _selfAccepted: false,
        _selfDeclined: false,
        _selfInvalidated: false,
        _disposeHandlers: [],
        _main,
        _requireSelf() {
          currentParents = me.parents.slice();
          currentChildModule = _main ? undefined : moduleId;
          __webpack_require__(moduleId);
        },

        // Module API
        active: true,
        accept(dep, callback, errorHandler) {
          if (dep === undefined) hot._selfAccepted = true;
          else if (typeof dep === 'function') hot._selfAccepted = dep;
          else if (typeof dep === 'object' && dep !== null) {
            for (let i = 0; i < dep.length; i++) {
              hot._acceptedDependencies[dep[i]] = callback || function () {};
              hot._acceptedErrorHandlers[dep[i]] = errorHandler;
            }
          } else {
            hot._acceptedDependencies[dep] = callback || function () {};
            hot._acceptedErrorHandlers[dep] = errorHandler;
          }
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
      let results = [];

      for (let i = 0; i < registeredStatusHandlers.length; i++) results[i] = registeredStatusHandlers[i].call(null, newStatus);

      return Promise.all(results);
    }

    function trackBlockingPromise(promise) {
      switch (currentStatus) {
        case 'ready':
          setStatus('prepare');
          blockingPromises.push(promise);
          waitForBlockingPromises(function () {
            return setStatus('ready');
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
      return setStatus('check')
        .then(__webpack_require__.hmrM)
        .then(function (update) {
          if (!update) {
            return setStatus(applyInvalidatedModules() ? 'ready' : 'idle').then(
              function () {
                return null;
              }
            );
          }

          return setStatus('prepare').then(function () {
            let updatedModules = [];
            blockingPromises = [];
            currentUpdateApplyHandlers = [];

            return Promise.all(
              Object.keys(__webpack_require__.hmrC).reduce(
                function (
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
                []
              )
            ).then(function () {
              return waitForBlockingPromises(function () {
                if (applyOnUpdate) {
                  return internalApply(applyOnUpdate);
                }
                return setStatus('ready').then(function () {
                  return updatedModules;
                });
              });
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
        return setStatus('abort').then(function () {
          throw errors[0];
        });
      }

      // Now in "dispose" phase
      let disposePromise = setStatus('dispose');

      results.forEach(function (result) {
        if (result.dispose) result.dispose();
      });

      // Now in "apply" phase
      let applyPromise = setStatus('apply');

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

      return Promise.all([disposePromise, applyPromise]).then(function () {
        // handle errors in accept handlers and self accepted module load
        if (error) {
          return setStatus('fail').then(function () {
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

        return setStatus('idle').then(function () {
          return outdatedModules;
        });
      });
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

    const moduleToHandlerFns = {
      load: init((scopeName, scope, key) => {
        ensureExistence(scopeName, key);
        return get(findVersion(scope, key));
      }),
      loadFallback: init((scopeName, scope, key, fallback) =>
        (scope && __webpack_require__.o(scope, key) ? get(findVersion(scope, key)) : fallback())),
      loadVersionCheck: init((scopeName, scope, key, version) => {
        ensureExistence(scopeName, key);
        return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
      }),
      loadSingletonVersionCheck: init((scopeName, scope, key, version) => {
        ensureExistence(scopeName, key);
        return getSingletonVersion(scope, scopeName, key, version);
      }),
      loadStrictVersionCheck: init((scopeName, scope, key, version) => {
        ensureExistence(scopeName, key);
        return getValidVersion(scope, scopeName, key, version);
      }),
      loadStrictSingletonVersionCheck: init((scopeName, scope, key, version) => {
        ensureExistence(scopeName, key);
        return getStrictSingletonVersion(scope, scopeName, key, version);
      }),
      loadVersionCheckFallback: init((scopeName, scope, key, version, fallback) => {
        if (!scope || !__webpack_require__.o(scope, key)) return fallback();
        return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
      }),
      loadSingletonVersionCheckFallback: init((scopeName, scope, key, version, fallback) => {
        if (!scope || !__webpack_require__.o(scope, key)) return fallback();
        return getSingletonVersion(scope, scopeName, key, version);
      }),
      loadStrictVersionCheckFallback: init((scopeName, scope, key, version, fallback) => {
        let entry = scope && __webpack_require__.o(scope, key) && findValidVersion(scope, key, version);
        return entry ? get(entry) : fallback();
      }),
      loadStrictSingletonVersionCheckFallback: init((scopeName, scope, key, version, fallback) => {
        if (!scope || !__webpack_require__.o(scope, key)) return fallback();
        return getStrictSingletonVersion(scope, scopeName, key, version);
      })
    };

    let installedModules = {};
    let moduleToHandlerMapping = {};
    Object.keys(remotes.moduleIdToSourceMapping || {}).forEach(id => {
      let [shareScope, shareKey, version, chunkIds, entryId,
        methodName = 'loadSingletonVersionCheckFallback'] = remotes.moduleIdToSourceMapping[id];
      let shareModule;
      moduleToHandlerMapping[id] = () => moduleToHandlerFns[methodName](
        shareScope,
        shareKey,
        version,
        () => {
          if (shareModule === undefined) {
            shareModule = __webpack_require__.m[entryId] || null;
            if (shareModule && !shareModule.__import_remote_shared__ && !shareModule.__import_remote_external__) shareModule = null;
          }
          if (shareModule) return shareModule;
          return Promise.all(chunkIds.map(chunkId => __webpack_require__.e(chunkId)))
            .then(() => () => __webpack_require__(entryId));
        }
      );
    });

    (() => {
      let initialConsumes = remotes.initialConsumes || [];
      let prom = null;
      __webpack_require__._init = rm => {
        if (rm) initialConsumes = rm.initialConsumes || [];
        else if (prom) return prom;
        return prom = Promise.all(initialConsumes.map(id => new Promise((resolve, reject) => {
          if (__webpack_modules__[id]) {
            installedModules[id] = 0;
            return resolve();
          }
          const fallback = factory => __webpack_modules__[id] = module => {
            // Handle case when module is used sync
            installedModules[id] = 0;
            delete __webpack_module_cache__[id];
            return module.exports = factory();
          };
          let factory = moduleToHandlerMapping[id]();
          if (factory && factory.then) factory.then(r => resolve(fallback(r))).catch(reject);
          else if (typeof factory !== 'function') reject('Shared module is not available for eager consumption: ' + id);
          else resolve(fallback(factory));
        })));
      };
    })();

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

    let loadStylesheet = (chunkId, sync) => {
      let href = __webpack_require__.miniCssF(chunkId);
      return new Promise((resolve, reject) => {
        if (!href) return resolve();
        href = __webpack_require__.p + href;

        importCss(href, {
          timeout,
          head: context.__wp__.doc.head,
          scopeName,
          host,
          devtool,
          beforeSource,
          cached: __webpack_chunk_cache__,
          cacheDB,
          sourcemapHost,
          sync,
          publicPath: __webpack_require__.p,
        }).then(resolve).catch(function (err) {
          delete installedCssChunks[chunkId];
          reject(err);
        });
      });
    };

    __webpack_require__.f.miniCss = (chunkId, promises, isEntryId) => {
      if (installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);
      else if (installedCssChunks[chunkId] !== 0) {
        promises.push(installedCssChunks[chunkId] = loadStylesheet(chunkId, isEntryId && sync).then(() => {
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
  // [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
  let installedChunks = __webpack_require__.hmrS_jsonp = __webpack_require__.hmrS_jsonp || {};

  __webpack_require__.f.j = (chunkId, promises, isEntryId) => {
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
                console.error('[import-remote] Loading chunk ' + realSrc + ' failed.');
                let error = new Error();
                error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
                error.name = 'ChunkLoadError';
                error.type = errorType;
                error.request = realSrc;
                installedChunkData[1](error);
              }
            }
          };
          __webpack_require__.l(url, loadingEnded, 'chunk-' + chunkId, chunkId, isEntryId);
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
  function loadUpdateChunk(chunkId, isEntryId) {
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
      __webpack_require__.l(url, loadingEnded, undefined, chunkId, isEntryId);
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
    } else if (installedChunks[chunkId] && installedChunks[chunkId] !== 0) {
      installedChunks[chunkId][0]();
      installedChunks[chunkId] = 0;
    }
  };
  // if (webpackVersion > 4 && hotUpdateGlobal && !self[hotUpdateGlobal]) self[hotUpdateGlobal] = context[hotUpdateGlobal];

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
      let module = __webpack_require__.c[outdatedModuleId];
      if (
        module
      && (module.hot._selfAccepted || module.hot._main)
      // removed self-accepted modules should not be required
      && appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire
      // when called invalidate self-accepting is not possible
      && !module.hot._selfInvalidated
      ) {
        outdatedSelfAcceptedModules.push({
          module: outdatedModuleId,
          require: module.hot._requireSelf,
          errorHandler: module.hot._selfAccepted
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
        let queue = outdatedModules.slice();
        while (queue.length > 0) {
          let moduleId = queue.pop();
          let module = __webpack_require__.c[moduleId];
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
            let module = __webpack_require__.c[outdatedModuleId];
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
              let errorHandlers = [];
              let dependenciesForCallbacks = [];
              for (let j = 0; j < moduleOutdatedDependencies.length; j++) {
                let dependency = moduleOutdatedDependencies[j];
                let acceptCallback = module.hot._acceptedDependencies[dependency];
                let errorHandler = module.hot._acceptedErrorHandlers[dependency];
                if (acceptCallback) {
                  if (callbacks.indexOf(acceptCallback) !== -1) continue;
                  callbacks.push(acceptCallback);
                  errorHandlers.push(errorHandler);
                  dependenciesForCallbacks.push(dependency);
                }
              }
              for (let k = 0; k < callbacks.length; k++) {
                try {
                  callbacks[k].call(null, moduleOutdatedDependencies);
                } catch (err) {
                  if (typeof errorHandlers[k] === 'function') {
                    try {
                      errorHandlers[k](err, {
                        moduleId: outdatedModuleId,
                        dependencyId: dependenciesForCallbacks[k]
                      });
                    } catch (err2) {
                      if (options.onErrored) {
                        options.onErrored({
                          type: 'accept-error-handler-errored',
                          moduleId: outdatedModuleId,
                          dependencyId: dependenciesForCallbacks[k],
                          error: err2,
                          originalError: err
                        });
                      }
                      if (!options.ignoreErrored) {
                        reportError(err2);
                        reportError(err);
                      }
                    }
                  } else {
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
                item.errorHandler(err, {
                  moduleId,
                  module: __webpack_require__.c[moduleId]
                });
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
                  reportError(err);
                }
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
      __webpack_require__.f.jsonpHmr = function (chunkId, promises, isEntryId) {
        if (
          currentUpdateChunks
              && !__webpack_require__.o(currentUpdateChunks, chunkId)
              && __webpack_require__.o(installedChunks, chunkId)
              && installedChunks[chunkId] !== undefined
        ) {
          promises.push(loadUpdateChunk(chunkId, isEntryId));
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
        // if (e && e.xhr && e.xhr.status === 404) return resolve();
        // reject(e);
        resolve();
      }
    });
  };

  // install a JSONP callback for chunk loading
  // function webpackJsonpCallback(data) {
  //   if (!Array.isArray(data)) return;
  //   let [chunkIds, moreModules, runtime, executeModules] = data;
  //   if (webpackVersion < 5) {
  //     executeModules = runtime;
  //     runtime = undefined;
  //   }
  //   // add "moreModules" to the modules object,
  //   // then flag all "chunkIds" as loaded and fire callback
  //   let moduleId; let chunkId;
  //   let i = 0;
  //   let resolves = [];
  //   for (;i < chunkIds.length; i++) {
  //     chunkId = chunkIds[i];
  //     if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
  //       resolves.push(installedChunks[chunkId][0]);
  //     }
  //     installedChunks[chunkId] = 0;
  //   }
  //   for (moduleId in moreModules) {
  //     if (__webpack_require__.o(moreModules, moduleId)
  //       && !__webpack_require__.o(__webpack_require__.m, moduleId)) {
  //       __webpack_require__.m[moduleId] = moreModules[moduleId];
  //     }
  //   }
  //   if (runtime) runtime(__webpack_require__);
  //   parentChunkLoadingFunction(data);
  //   while (resolves.length) {
  //     resolves.shift()();
  //   }

  //   // add entry modules from loaded chunk to deferred list
  //   if (executeModules) deferredModules.push.apply(deferredModules, executeModules);

  //   // run deferred modules when all chunks ready
  //   return checkDeferredModules();
  // }

  function webpackJsonpCallback(parentChunkLoadingFunction, data) {
    if (!Array.isArray(data)) return;
    let [chunkIds, moreModules, runtime] = data;
    if (webpackVersion < 5) {
      if (Array.isArray(runtime)) runtime = undefined;
    }

    let result;

    // add "moreModules" to the modules object,
    // then flag all "chunkIds" as loaded and fire callback
    let moduleId; let chunkId; let i = 0;
    if (chunkIds.some(id => (installedChunks[id] !== 0))) {
      for (moduleId in moreModules) {
        if (__webpack_require__.o(moreModules, moduleId) && !__webpack_require__.o(__webpack_require__.m, moduleId)) {
          __webpack_require__.m[moduleId] = moreModules[moduleId];
        }
      }
      if (runtime) result = runtime(__webpack_require__);
    }
    if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
    for (;i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
        installedChunks[chunkId][0]();
      }
      installedChunks[chunkIds[i]] = 0;
    }
    return __webpack_require__.O(result);
  }

  chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
  return __webpack_require__;
}

export default createRuntime;
