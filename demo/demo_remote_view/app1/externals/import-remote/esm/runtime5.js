"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("regenerator-runtime/runtime");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.array.filter");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es6.function.name");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.array.reduce");

require("core-js/modules/es6.promise");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.index-of");

require("core-js/modules/es6.object.create");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.array.map");

require("core-js/modules/es6.array.is-array");

require("core-js/modules/es6.function.bind");

var _fetch = _interopRequireWildcard(require("./fetch"));

var _utils = require("./utils");

var _importCss = _interopRequireDefault(require("./importCss"));

var _importJs = _interopRequireDefault(require("./importJs"));

var _jsonp = _interopRequireDefault(require("./jsonp"));

var _semver = require("./semver");

/* eslint-disable camelcase */
function createRuntime() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$jsonpFunction = _ref.jsonpFunction,
      jsonpFunction = _ref$jsonpFunction === void 0 ? 'webpackJsonp' : _ref$jsonpFunction,
      _ref$publicPath = _ref.publicPath,
      publicPath = _ref$publicPath === void 0 ? '' : _ref$publicPath,
      _ref$host = _ref.host,
      host = _ref$host === void 0 ? '' : _ref$host,
      _ref$devtool = _ref.devtool,
      devtool = _ref$devtool === void 0 ? false : _ref$devtool,
      hot = _ref.hot,
      _ref$hash = _ref.hash,
      hash = _ref$hash === void 0 ? '' : _ref$hash,
      _ref$uniqueName = _ref.uniqueName,
      uniqueName = _ref$uniqueName === void 0 ? '' : _ref$uniqueName,
      _ref$scopeName = _ref.scopeName,
      scopeName = _ref$scopeName === void 0 ? '' : _ref$scopeName,
      _ref$hotUpdateGlobal = _ref.hotUpdateGlobal,
      hotUpdateGlobal = _ref$hotUpdateGlobal === void 0 ? '' : _ref$hotUpdateGlobal,
      _ref$sourcemapHost = _ref.sourcemapHost,
      sourcemapHost = _ref$sourcemapHost === void 0 ? '' : _ref$sourcemapHost,
      _ref$cssChunks = _ref.cssChunks,
      cssChunks = _ref$cssChunks === void 0 ? {} : _ref$cssChunks,
      _ref$jsChunks = _ref.jsChunks,
      jsChunks = _ref$jsChunks === void 0 ? {} : _ref$jsChunks,
      _ref$context = _ref.context,
      context = _ref$context === void 0 ? {} : _ref$context,
      _ref$webpackVersion = _ref.webpackVersion,
      webpackVersion = _ref$webpackVersion === void 0 ? 4 : _ref$webpackVersion,
      _ref$cached = _ref.cached,
      cached = _ref$cached === void 0 ? _fetch.globalCached : _ref$cached,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? _utils.DEFAULT_TIMEOUT : _ref$timeout,
      requireExternal = _ref.requireExternal,
      beforeSource = _ref.beforeSource,
      _ref$remotes = _ref.remotes,
      remotes = _ref$remotes === void 0 ? {} : _ref$remotes;

  var __webpack_modules__ = {};
  /** ********************************************************************* */
  // The module cache

  var __webpack_module_cache__ = {};
  if (!context[jsonpFunction]) (0, _utils.innumerable)(context, jsonpFunction, []);
  var chunkLoadingGlobal = context[jsonpFunction];
  var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
  chunkLoadingGlobal.push = webpackJsonpCallback;
  if (webpackVersion > 4 && remotes.loading && cached === _fetch.globalCached && !self[jsonpFunction]) self[jsonpFunction] = chunkLoadingGlobal; // The require function

  function __webpack_require__(moduleId, entryFile) {
    if (Array.isArray(moduleId)) return moduleId.map(function (id, i) {
      return __webpack_require__(id, entryFile[i]);
    }); // Check if module is in cache

    if (__webpack_module_cache__[moduleId]) {
      return __webpack_module_cache__[moduleId].exports;
    }

    if (!__webpack_modules__[moduleId] && entryFile && __webpack_modules__[entryFile]) moduleId = entryFile;

    if (!__webpack_modules__[moduleId]) {
      var result;
      result = requireExternal(moduleId);
      if (result === undefined) console.error("[import-remote]module[".concat(moduleId, "] not exist!"));
      return result;
    } // Create a new module (and put it into the cache)


    var module = __webpack_module_cache__[moduleId] = {
      inRemoteModule: true,
      requireExternal: requireExternal,
      resolveUrl: function resolveUrl(path) {
        return (0, _utils.joinUrl)(__webpack_require__.p, path);
      },
      publicPath: __webpack_require__.p,
      id: moduleId,
      loaded: false,
      exports: {}
    }; // Execute the module function

    var execOptions = {
      id: moduleId,
      module: module,
      factory: __webpack_modules__[moduleId],
      require: __webpack_require__
    };

    __webpack_require__.i.forEach(function (handler) {
      handler(execOptions);
    });

    module = execOptions.module;
    execOptions.factory.call(module.exports, module, module.exports, execOptions.require); // Flag the module as loaded

    if (Object.getOwnPropertyDescriptor(module, 'loaded').value !== undefined) {
      module.loaded = true;
    } // Return the exports of the module


    return module.exports;
  }
  /* webpack/runtime/publicPath */


  __webpack_require__.p = (0, _utils.joinUrl)(host, publicPath); // expose the modules object (__webpack_modules__)

  __webpack_require__.m = __webpack_modules__; // expose the module cache

  __webpack_require__.c = __webpack_module_cache__; // expose the module execution interceptor

  __webpack_require__.i = [];
  /** ********************************************************************* */

  /* webpack/runtime/compat get default export */
  // getDefaultExport function for compatibility with non-harmony modules

  __webpack_require__.n = function (module) {
    var getter = module && module.__esModule ? function () {
      return module["default"];
    } : function () {
      return module;
    };

    __webpack_require__.d(getter, {
      a: getter
    });

    return getter;
  };
  /* webpack/runtime/create fake namespace object */
  // eslint-disable-next-line no-proto


  var getProto = Object.getPrototypeOf ? function (obj) {
    return Object.getPrototypeOf(obj);
  } : function (obj) {
    return obj.__proto__;
  };
  var leafPrototypes; // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 16: return value when it's Promise-like
  // mode & 8|1: behave like require

  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = this(value);
    if (mode & 8) return value;

    if ((0, _typeof2["default"])(value) === 'object' && value) {
      if (mode & 4 && value.__esModule) return value;
      if (mode & 16 && typeof value.then === 'function') return value;
    }

    var ns = Object.create(null);

    __webpack_require__.r(ns);

    var def = {};
    leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];

    for (var current = mode & 2 && value; (0, _typeof2["default"])(current) == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
      Object.getOwnPropertyNames(current).forEach(function (key) {
        return def[key] = function () {
          return value[key];
        };
      });
    }

    def["default"] = function () {
      return value;
    };

    __webpack_require__.d(ns, def);

    return ns;
  };
  /* webpack/runtime/define property getters */
  // define getter functions for harmony exports


  __webpack_require__.d = function (exports, definition, getter) {
    if (getter) {
      if (!__webpack_require__.o(exports, definition)) {
        (0, _fetch.objectDefineProperty)(exports, definition, {
          enumerable: true,
          get: getter
        });
      }

      return;
    }

    for (var key in definition) {
      if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
        (0, _fetch.objectDefineProperty)(exports, key, {
          enumerable: true,
          get: definition[key]
        });
      }
    }
  };
  /* webpack/runtime/ensure chunk */


  __webpack_require__.f = {}; // This file contains only the entry chunk.
  // The chunk loading function for additional chunks

  __webpack_require__.e = function (chunkId) {
    return Promise.all(Object.keys(__webpack_require__.f).reduce(function (promises, key) {
      __webpack_require__.f[key](chunkId, promises);

      return promises;
    }, []));
  };
  /* webpack/runtime/get javascript chunk filename */
  // This function allow to reference async chunks


  __webpack_require__.u = function (chunkId) {
    return (// return url for filenames based on template
      jsChunks[chunkId] || chunkId + '.js'
    );
  };
  /* webpack/runtime/get javascript update chunk filename */
  // This function allow to reference all chunks


  __webpack_require__.hu = function (chunkId) {
    return (// return url for filenames based on template
      '' + chunkId + '.' + __webpack_require__.h() + '.hot-update.js'
    );
  };
  /* webpack/runtime/get mini-css chunk filename */
  // This function allow to reference all chunks


  var _miniCssF = null;

  __webpack_require__.miniCssF = function (chunkId) {
    var file = cssChunks[chunkId];
    if (file) return file; // eslint-disable-next-line no-eval

    if (!_miniCssF) _miniCssF = remotes._miniCssF ? eval(remotes._miniCssF) : function () {
      return false;
    };
    return _miniCssF(chunkId);
  };
  /* webpack/runtime/get update manifest filename */


  __webpack_require__.hmrF = function () {
    return '' + __webpack_require__.h() + '.hot-update.json';
  };
  /* webpack/runtime/getFullHash */


  __webpack_require__.h = function () {
    return hash;
  };
  /* webpack/runtime/global */


  __webpack_require__.g = function () {
    // eslint-disable-next-line no-undef
    if ((typeof globalThis === "undefined" ? "undefined" : (0, _typeof2["default"])(globalThis)) === 'object') return globalThis;

    try {
      // eslint-disable-next-line no-new-func
      return this || new Function('return this')();
    } catch (e) {
      if ((typeof window === "undefined" ? "undefined" : (0, _typeof2["default"])(window)) === 'object') return window;
    }
  }();
  /* webpack/runtime/hasOwnProperty shorthand */


  __webpack_require__.o = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
  /* webpack/runtime/load script */


  var inProgress = {}; // loadScript function to load a script via script tag

  __webpack_require__.l = function (url, done, key) {
    if (inProgress[url]) {
      inProgress[url].push(done);
      return;
    }

    inProgress[url] = [done];

    var onScriptComplete = function onScriptComplete(ex) {
      var doneFns = inProgress[url] || [];
      delete inProgress[url];
      doneFns && doneFns.forEach(function (fn) {
        return fn && fn(ex);
      });
    };

    if (!Array.isArray(url)) url = [url];
    var fn = webpackVersion < 5 || !key || key.startsWith('chunk-') ? _importJs["default"] : _jsonp["default"];
    return Promise.all(url.map(function (u) {
      return fn(u, {
        timeout: timeout,
        global: context,
        cached: cached,
        scopeName: scopeName,
        host: host,
        devtool: devtool,
        beforeSource: beforeSource,
        webpackChunk: true,
        sourcemapHost: sourcemapHost,
        publicPath: __webpack_require__.p,
        key: key ? "".concat(uniqueName, ":").concat(key) : ''
      });
    })).then(onScriptComplete)["catch"](onScriptComplete);
  };
  /* webpack/runtime/make namespace object */
  // define __esModule on exports


  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      (0, _fetch.objectDefineProperty)(exports, Symbol.toStringTag, {
        value: 'Module'
      });
    }

    (0, _fetch.objectDefineProperty)(exports, '__esModule', {
      value: true
    });
  };
  /* webpack/runtime/node module decorator */


  __webpack_require__.nmd = function (module) {
    module.paths = [];
    if (!module.children) module.children = [];
    return module;
  };
  /* webpack/runtime/remotes loading */


  var chunkMapping = remotes.chunkMapping || {};
  var idToExternalAndNameMapping = remotes.idToExternalAndNameMapping || {};

  __webpack_require__.f.remotes = function (chunkId, promises) {
    if (__webpack_require__.o(chunkMapping, chunkId)) {
      chunkMapping[chunkId].forEach(function (id) {
        var getScope = __webpack_require__.R;
        if (!getScope) getScope = [];
        var data = idToExternalAndNameMapping[id];
        if (getScope.indexOf(data) >= 0) return;
        getScope.push(data);
        if (data.p) return promises.push(data.p);

        var onError = function onError(error) {
          if (!error) error = new Error('Container missing');
          if (typeof error.message === 'string') error.message += '\nwhile loading "' + data[1] + '" from ' + data[2];

          __webpack_modules__[id] = function () {
            throw error;
          };

          data.p = 0;
        };

        var handleFunction = function handleFunction(fn, arg1, arg2, d, next, first) {
          try {
            var promise = (0, _utils.isFunction)(fn) ? fn(arg1, arg2) : fn;

            if (promise && promise.then) {
              var p = promise.then(function (result) {
                return next(result, d);
              }, onError);
              if (first) promises.push(data.p = p);else return p;
            } else {
              return next(promise, d, first);
            }
          } catch (error) {
            onError(error);
          }
        };

        var onFactory = function onFactory(factory) {
          data.p = 1;

          __webpack_modules__[id] = function (module) {
            module.exports = (0, _utils.isFunction)(factory) ? factory() : factory;
          };
        };

        var onInitialized = function onInitialized(_, external, first) {
          return handleFunction(external.get, data[1], getScope, 0, onFactory, first);
        };

        var onExternal = function onExternal(external, _, first) {
          return external ? handleFunction(__webpack_require__.I, data[0], 0, external, onInitialized, first) : onError();
        };

        handleFunction(__webpack_require__, data[2], 0, 0, onExternal, 1);
      });
    }
  };
  /* webpack/runtime/sharing */


  (function () {
    __webpack_require__.S = {};
    var initPromises = {};
    var initTokens = {};

    __webpack_require__.I = function (name, initScope) {
      if (!initScope) initScope = []; // handling circular init calls

      var initToken = initTokens[name];
      if (!initToken) initToken = initTokens[name] = {};
      if (initScope.indexOf(initToken) >= 0) return;
      initScope.push(initToken); // only runs once

      if (initPromises[name]) return initPromises[name]; // creates a new share scope if needed

      if (!__webpack_require__.o(__webpack_require__.S, name)) __webpack_require__.S[name] = {}; // runs all init snippets from all modules reachable

      var scope = __webpack_require__.S[name];

      var warn = function warn(msg) {
        return typeof console !== 'undefined' && console.warn && console.warn(msg);
      };

      var register = function register(name, version, factory, loaded) {
        var versions = scope[name] = scope[name] || {};
        var activeVersion = versions[version];

        if (!activeVersion || !activeVersion.loaded && uniqueName > activeVersion.from) {
          versions[version] = {
            get: factory,
            from: uniqueName,
            loaded: loaded
          };
        }
      };

      var promises = [];

      var initExternal = function initExternal(id) {
        var handleError = function handleError(err) {
          return warn('Initialization of sharing external failed: ' + err);
        };

        try {
          var module = __webpack_require__(id);

          if (!module) return;

          var initFn = function initFn(module) {
            return module && module.init && module.init(__webpack_require__.S[name], initScope);
          };

          if (module.then) return promises.push(module.then(initFn, handleError));
          var initResult = initFn(module);
          if (initResult && initResult.then) return promises.push(initResult["catch"](handleError));
        } catch (err) {
          handleError(err);
        }
      };

      var initCode = remotes.initCodePerScope && remotes.initCodePerScope[name] || [];

      if (initCode) {
        initCode.forEach(function (item) {
          var _item = (0, _slicedToArray2["default"])(item, 1),
              type = _item[0];

          if (type === 'register') {
            var _item2 = (0, _slicedToArray2["default"])(item, 5),
                shareKey = _item2[1],
                version = _item2[2],
                chunkIds = _item2[3],
                entryId = _item2[4];

            var shareModule = __webpack_require__.m[entryId];
            if (shareModule && !shareModule.__import_remote_shared__ && !shareModule.__import_remote_external__) shareModule = null;
            register(shareKey, version, function () {
              if (shareModule) return shareModule;
              return Promise.all(chunkIds.map(function (id) {
                return __webpack_require__.e(id);
              })).then(function () {
                return function () {
                  return __webpack_require__(entryId);
                };
              });
            }, shareModule ? 1 : 0);
          }

          if (type === 'init') {
            var _item3 = (0, _slicedToArray2["default"])(item, 2),
                _entryId = _item3[1];

            initExternal(_entryId);
          }
        });
      }

      if (!promises.length) return initPromises[name] = 1;
      return initPromises[name] = Promise.all(promises).then(function () {
        return initPromises[name] = 1;
      });
    };
  })();
  /* webpack/runtime/hot module replacement */


  (function () {
    var currentModuleData = {};
    var installedModules = __webpack_require__.c; // module and require creation

    var currentChildModule;
    var currentParents = []; // status

    var registeredStatusHandlers = [];
    var currentStatus = 'idle'; // while downloading

    var blockingPromises; // The update info

    var currentUpdateApplyHandlers;
    var queuedInvalidatedModules;
    __webpack_require__.hmrD = currentModuleData;

    if (hot) {
      __webpack_require__.i.push(function (options) {
        var module = options.module;

        var require = createRequire(options.require, options.id);

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
      var me = installedModules[moduleId];
      if (!me) return require;

      var fn = function fn(request) {
        if (me.hot.active) {
          if (installedModules[request]) {
            var parents = installedModules[request].parents;

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
          console.warn('[HMR] unexpected require(' + request + ') from disposed module ' + moduleId);
          currentParents = [];
        }

        return require(request);
      };

      var createPropertyDescriptor = function createPropertyDescriptor(name) {
        return {
          configurable: true,
          enumerable: true,
          get: function get() {
            return require[name];
          },
          set: function set(value) {
            require[name] = value;
          }
        };
      };

      for (var name in require) {
        if (Object.prototype.hasOwnProperty.call(require, name) && name !== 'e') {
          (0, _fetch.objectDefineProperty)(fn, name, createPropertyDescriptor(name));
        }
      }

      fn.e = function (chunkId) {
        return trackBlockingPromise(require.e(chunkId));
      };

      return fn;
    }

    function createModuleHotObject(moduleId, me) {
      var hot = {
        // private stuff
        _acceptedDependencies: {},
        _declinedDependencies: {},
        _selfAccepted: false,
        _selfDeclined: false,
        _selfInvalidated: false,
        _disposeHandlers: [],
        _main: currentChildModule !== moduleId,
        _requireSelf: function _requireSelf() {
          currentParents = me.parents.slice();
          currentChildModule = moduleId;

          __webpack_require__(moduleId);
        },
        // Module API
        active: true,
        accept: function accept(dep, callback) {
          if (dep === undefined) hot._selfAccepted = true;else if (typeof dep === 'function') hot._selfAccepted = dep;else if ((0, _typeof2["default"])(dep) === 'object' && dep !== null) {
            for (var i = 0; i < dep.length; i++) {
              hot._acceptedDependencies[dep[i]] = callback || function () {};
            }
          } else hot._acceptedDependencies[dep] = callback || function () {};
        },
        decline: function decline(dep) {
          if (dep === undefined) hot._selfDeclined = true;else if ((0, _typeof2["default"])(dep) === 'object' && dep !== null) for (var i = 0; i < dep.length; i++) {
            hot._declinedDependencies[dep[i]] = true;
          } else hot._declinedDependencies[dep] = true;
        },
        dispose: function dispose(callback) {
          hot._disposeHandlers.push(callback);
        },
        addDisposeHandler: function addDisposeHandler(callback) {
          hot._disposeHandlers.push(callback);
        },
        removeDisposeHandler: function removeDisposeHandler(callback) {
          var idx = hot._disposeHandlers.indexOf(callback);

          if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
        },
        invalidate: function invalidate() {
          this._selfInvalidated = true;

          switch (currentStatus) {
            case 'idle':
              currentUpdateApplyHandlers = [];
              Object.keys(__webpack_require__.hmrI).forEach(function (key) {
                __webpack_require__.hmrI[key](moduleId, currentUpdateApplyHandlers);
              });
              setStatus('ready');
              break;

            case 'ready':
              Object.keys(__webpack_require__.hmrI).forEach(function (key) {
                __webpack_require__.hmrI[key](moduleId, currentUpdateApplyHandlers);
              });
              break;

            case 'prepare':
            case 'check':
            case 'dispose':
            case 'apply':
              (queuedInvalidatedModules = queuedInvalidatedModules || []).push(moduleId);
              break;

            default:
              // ignore requests in error states
              break;
          }
        },
        // Management API
        check: hotCheck,
        apply: hotApply,
        status: function status(l) {
          if (!l) return currentStatus;
          registeredStatusHandlers.push(l);
        },
        addStatusHandler: function addStatusHandler(l) {
          registeredStatusHandlers.push(l);
        },
        removeStatusHandler: function removeStatusHandler(l) {
          var idx = registeredStatusHandlers.indexOf(l);
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

      for (var i = 0; i < registeredStatusHandlers.length; i++) {
        registeredStatusHandlers[i].call(null, newStatus);
      }
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
      var blocker = blockingPromises;
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
        var updatedModules = [];
        blockingPromises = [];
        currentUpdateApplyHandlers = [];
        return Promise.all(Object.keys(__webpack_require__.hmrC).reduce(function (promises, key) {
          __webpack_require__.hmrC[key](update.c, update.r, update.m, promises, currentUpdateApplyHandlers, updatedModules);

          return promises;
        }, [])).then(function () {
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
      var results = currentUpdateApplyHandlers.map(function (handler) {
        return handler(options);
      });
      currentUpdateApplyHandlers = undefined;
      var errors = results.map(function (r) {
        return r.error;
      }).filter(Boolean);

      if (errors.length > 0) {
        setStatus('abort');
        return Promise.resolve().then(function () {
          throw errors[0];
        });
      } // Now in "dispose" phase


      setStatus('dispose');
      results.forEach(function (result) {
        if (result.dispose) result.dispose();
      }); // Now in "apply" phase

      setStatus('apply');
      var error;

      var reportError = function reportError(err) {
        if (!error) error = err;
      };

      var outdatedModules = [];
      results.forEach(function (result) {
        if (result.apply) {
          var modules = result.apply(reportError);

          if (modules) {
            for (var i = 0; i < modules.length; i++) {
              outdatedModules.push(modules[i]);
            }
          }
        }
      }); // handle errors in accept handlers and self accepted module load

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
            __webpack_require__.hmrI[key](moduleId, currentUpdateApplyHandlers);
          });
        });
        queuedInvalidatedModules = undefined;
        return true;
      }
    }
  })();
  /* webpack/runtime/consumes */


  (function () {
    var ensureExistence = function ensureExistence(scopeName, key) {
      var scope = __webpack_require__.S[scopeName];
      if (!scope || !__webpack_require__.o(scope, key)) throw new Error('Shared module ' + key + " doesn't exist in shared scope " + scopeName);
      return scope;
    };

    var findVersion = function findVersion(scope, key) {
      var versions = scope[key];
      key = Object.keys(versions).reduce(function (a, b) {
        return !a || (0, _semver.versionLt)(a, b) ? b : a;
      }, 0);
      return key && versions[key];
    };

    var findSingletonVersionKey = function findSingletonVersionKey(scope, key) {
      var versions = scope[key];
      return Object.keys(versions).reduce(function (a, b) {
        return !a || !versions[a].loaded && (0, _semver.versionLt)(a, b) ? b : a;
      }, 0);
    };

    var get = function get(entry) {
      entry.loaded = 1;
      return entry.get();
    }; // eslint-disable-next-line max-len


    var getInvalidSingletonVersionMessage = function getInvalidSingletonVersionMessage(key, version, requiredVersion) {
      return 'Unsatisfied version ' + version + ' of shared singleton module ' + key + ' (required ' + (0, _semver.rangeToString)(requiredVersion) + ')';
    };

    var getSingletonVersion = function getSingletonVersion(scope, scopeName, key, requiredVersion) {
      var version = findSingletonVersionKey(scope, key);

      if (!(0, _semver.satisfy)(requiredVersion, version)) {
        typeof console !== 'undefined' && console.warn && console.warn(getInvalidSingletonVersionMessage(key, version, requiredVersion));
      }

      return get(scope[key][version]);
    };

    var getStrictSingletonVersion = function getStrictSingletonVersion(scope, scopeName, key, requiredVersion) {
      var version = findSingletonVersionKey(scope, key);
      if (!(0, _semver.satisfy)(requiredVersion, version)) throw new Error(getInvalidSingletonVersionMessage(key, version, requiredVersion));
      return get(scope[key][version]);
    };

    var findValidVersion = function findValidVersion(scope, key, requiredVersion) {
      var versions = scope[key];
      key = Object.keys(versions).reduce(function (a, b) {
        if (!(0, _semver.satisfy)(requiredVersion, b)) return a;
        return !a || (0, _semver.versionLt)(a, b) ? b : a;
      }, 0);
      return key && versions[key];
    };

    var getInvalidVersionMessage = function getInvalidVersionMessage(scope, scopeName, key, requiredVersion) {
      var versions = scope[key];
      return 'No satisfying version (' + (0, _semver.rangeToString)(requiredVersion) + ') of shared module ' + key + ' found in shared scope ' + scopeName + '.\n' + 'Available versions: ' + Object.keys(versions).map(function (key) {
        return key + ' from ' + versions[key].from;
      }).join(', ');
    };

    var getValidVersion = function getValidVersion(scope, scopeName, key, requiredVersion) {
      var entry = findValidVersion(scope, key, requiredVersion);
      if (entry) return get(entry);
      throw new Error(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));
    };

    var warnInvalidVersion = function warnInvalidVersion(scope, scopeName, key, requiredVersion) {
      typeof console !== 'undefined' && console.warn && console.warn(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));
    };

    var init = function init(fn) {
      return function (scopeName, a, b, c) {
        var promise = __webpack_require__.I(scopeName);

        if (promise && promise.then) return promise.then(fn.bind(fn, scopeName, __webpack_require__.S[scopeName], a, b, c));
        return fn(scopeName, __webpack_require__.S[scopeName], a, b, c);
      };
    };

    var moduleToHandlerFns = {
      load: init(function (scopeName, scope, key) {
        ensureExistence(scopeName, key);
        return get(findVersion(scope, key));
      }),
      loadFallback: init(function (scopeName, scope, key, fallback) {
        return scope && __webpack_require__.o(scope, key) ? get(findVersion(scope, key)) : fallback();
      }),
      loadVersionCheck: init(function (scopeName, scope, key, version) {
        ensureExistence(scopeName, key);
        return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
      }),
      loadSingletonVersionCheck: init(function (scopeName, scope, key, version) {
        ensureExistence(scopeName, key);
        return getSingletonVersion(scope, scopeName, key, version);
      }),
      loadStrictVersionCheck: init(function (scopeName, scope, key, version) {
        ensureExistence(scopeName, key);
        return getValidVersion(scope, scopeName, key, version);
      }),
      loadStrictSingletonVersionCheck: init(function (scopeName, scope, key, version) {
        ensureExistence(scopeName, key);
        return getStrictSingletonVersion(scope, scopeName, key, version);
      }),
      loadVersionCheckFallback: init(function (scopeName, scope, key, version, fallback) {
        if (!scope || !__webpack_require__.o(scope, key)) return fallback();
        return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
      }),
      loadSingletonVersionCheckFallback: init(function (scopeName, scope, key, version, fallback) {
        if (!scope || !__webpack_require__.o(scope, key)) return fallback();
        return getSingletonVersion(scope, scopeName, key, version);
      }),
      loadStrictVersionCheckFallback: init(function (scopeName, scope, key, version, fallback) {
        var entry = scope && __webpack_require__.o(scope, key) && findValidVersion(scope, key, version);
        return entry ? get(entry) : fallback();
      }),
      loadStrictSingletonVersionCheckFallback: init(function (scopeName, scope, key, version, fallback) {
        if (!scope || !__webpack_require__.o(scope, key)) return fallback();
        return getStrictSingletonVersion(scope, scopeName, key, version);
      })
    };
    var installedModules = {};
    var moduleToHandlerMapping = {};
    Object.keys(remotes.moduleIdToSourceMapping || {}).forEach(function (id) {
      var _remotes$moduleIdToSo = (0, _slicedToArray2["default"])(remotes.moduleIdToSourceMapping[id], 6),
          shareScope = _remotes$moduleIdToSo[0],
          shareKey = _remotes$moduleIdToSo[1],
          version = _remotes$moduleIdToSo[2],
          chunkIds = _remotes$moduleIdToSo[3],
          entryId = _remotes$moduleIdToSo[4],
          _remotes$moduleIdToSo2 = _remotes$moduleIdToSo[5],
          methodName = _remotes$moduleIdToSo2 === void 0 ? 'loadSingletonVersionCheckFallback' : _remotes$moduleIdToSo2;

      var shareModule;

      moduleToHandlerMapping[id] = function () {
        return moduleToHandlerFns[methodName](shareScope, shareKey, version, function () {
          if (shareModule === undefined) {
            shareModule = __webpack_require__.m[entryId] || null;
            if (shareModule && !shareModule.__import_remote_shared__ && !shareModule.__import_remote_external__) shareModule = null;
          }

          if (shareModule) return shareModule;
          return Promise.all(chunkIds.map(function (chunkId) {
            return __webpack_require__.e(chunkId);
          })).then(function () {
            return function () {
              return __webpack_require__(entryId);
            };
          });
        });
      };
    });

    (function () {
      var initialConsumes = remotes.initialConsumes || [];
      var prom = null;

      __webpack_require__._init = function (rm) {
        if (rm) initialConsumes = rm.initialConsumes || [];else if (prom) return prom;
        return prom = Promise.all(initialConsumes.map(function (id) {
          return new Promise(function (resolve, reject) {
            if (__webpack_modules__[id]) {
              installedModules[id] = 0;
              return resolve();
            }

            var fallback = function fallback(factory) {
              return __webpack_modules__[id] = function (module) {
                // Handle case when module is used sync
                installedModules[id] = 0;
                delete __webpack_module_cache__[id];
                return module.exports = factory();
              };
            };

            var factory = moduleToHandlerMapping[id]();
            if (factory && factory.then) factory.then(function (r) {
              return resolve(fallback(r));
            })["catch"](reject);else if (typeof factory !== 'function') reject('Shared module is not available for eager consumption: ' + id);else resolve(fallback(factory));
          });
        }));
      };
    })();

    var chunkMapping = remotes.chunkToModuleMapping || {};

    __webpack_require__.f.consumes = function (chunkId, promises) {
      if (__webpack_require__.o(chunkMapping, chunkId)) {
        chunkMapping[chunkId].forEach(function (id) {
          if (__webpack_require__.o(installedModules, id)) return promises.push(installedModules[id]);

          var onFactory = function onFactory(factory) {
            installedModules[id] = 0;

            __webpack_modules__[id] = function (module) {
              delete __webpack_module_cache__[id];
              module.exports = factory();
            };
          };

          var onError = function onError(error) {
            delete installedModules[id];

            __webpack_modules__[id] = function (module) {
              delete __webpack_module_cache__[id];
              throw error;
            };
          };

          try {
            var promise = moduleToHandlerMapping[id]();

            if (promise.then) {
              promises.push(installedModules[id] = promise.then(onFactory)["catch"](onError));
            } else onFactory(promise);
          } catch (e) {
            onError(e);
          }
        });
      }
    };
  })();
  /* webpack/runtime/css loading */


  (function () {
    var installedCssChunks = {};

    var loadStylesheet = function loadStylesheet(chunkId) {
      var href = __webpack_require__.miniCssF(chunkId);

      return new Promise(function (resolve, reject) {
        if (!href) return resolve();
        href = __webpack_require__.p + href;
        (0, _importCss["default"])(href, {
          timeout: timeout,
          head: context.__windowProxy__.doc.head,
          scopeName: scopeName,
          host: host,
          devtool: devtool,
          beforeSource: beforeSource,
          cached: cached,
          sourcemapHost: sourcemapHost,
          publicPath: __webpack_require__.p
        }).then(resolve)["catch"](function (err) {
          delete installedCssChunks[chunkId];
          reject(err);
        });
      });
    };

    __webpack_require__.f.miniCss = function (chunkId, promises) {
      if (installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);else if (installedCssChunks[chunkId] !== 0) {
        promises.push(installedCssChunks[chunkId] = loadStylesheet(chunkId).then(function () {
          installedCssChunks[chunkId] = 0;
        }, function (e) {
          delete installedCssChunks[chunkId];
          throw e;
        }));
      }
    };

    __webpack_require__.hmrC.miniCss = function (chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList) {
      chunkIds.forEach(function (chunkId) {
        return promises.push(loadStylesheet(chunkId));
      });
    };
  })();
  /* webpack/runtime/jsonp chunk loading */


  if (remotes.withBaseURI) __webpack_require__.b = document.baseURI || self.location.href; // object to store loaded and loading chunks
  // undefined = chunk not loaded, null = chunk preloaded/prefetched
  // Promise = chunk loading, 0 = chunk loaded

  var installedChunks = {};
  var deferredModules = [];

  __webpack_require__.f.j = function (chunkId, promises) {
    // JSONP chunk loading for javascript
    var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;

    if (installedChunkData !== 0) {
      // 0 means "already installed".
      // a Promise means "currently loading".
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        if (hasJsMatcher(chunkId)) {
          // setup Promise in chunk cache
          var promise = new Promise(function (resolve, reject) {
            installedChunkData = installedChunks[chunkId] = [resolve, reject];
          });
          promises.push(installedChunkData[2] = promise); // start chunk loading

          var url = __webpack_require__.u(chunkId);

          if (Array.isArray(url)) url = url.map(function (u) {
            return __webpack_require__.p + u;
          });else url = __webpack_require__.p + url; // create error before stack unwound to get useful stacktrace later

          var loadingEnded = function loadingEnded(event) {
            if (__webpack_require__.o(installedChunks, chunkId)) {
              installedChunkData = installedChunks[chunkId];
              if (installedChunkData !== 0) installedChunks[chunkId] = undefined;

              if (installedChunkData) {
                var errorType = event && (event.type === 'load' ? 'missing' : event.type);
                var realSrc = event && event.target && event.target.src;
                var error = new Error();
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

  var hasJsMatcher = webpackVersion <= 5 ? function (chunkId) {
    return jsChunks[chunkId];
  } : typeof remotes.hasJsMatcher === 'string' ? function (chunkId) {
    return !new RegExp(remotes.hasJsMatcher).test(chunkId);
  } : function () {
    return remotes.hasJsMatcher == null || remotes.hasJsMatcher;
  };
  var currentUpdatedModulesList;
  var waitingUpdateResolves = {};

  function loadUpdateChunk(chunkId) {
    return new Promise(function (resolve, reject) {
      waitingUpdateResolves[chunkId] = resolve; // start update chunk loading

      var url = __webpack_require__.p + __webpack_require__.hu(chunkId); // create error before stack unwound to get useful stacktrace later


      var error = new Error();

      var loadingEnded = function loadingEnded(event) {
        if (waitingUpdateResolves[chunkId]) {
          waitingUpdateResolves[chunkId] = undefined;
          var errorType = event && (event.type === 'load' ? 'missing' : event.type);
          var realSrc = event && event.target && event.target.src;
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

  var currentUpdate;
  var currentUpdateChunks;
  var currentUpdateRemovedChunks;
  var currentUpdateRuntime;
  (0, _utils.innumerable)(context, hotUpdateGlobal || 'webpackHotUpdate', function (chunkId, moreModules, runtime) {
    if (currentUpdate) {
      for (var moduleId in moreModules) {
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
  }); // if (webpackVersion > 4 && hotUpdateGlobal && !self[hotUpdateGlobal]) self[hotUpdateGlobal] = context[hotUpdateGlobal];

  function applyHandler(options) {
    if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr;
    currentUpdateChunks = undefined;

    function getAffectedModuleEffects(updateModuleId) {
      var outdatedModules = [updateModuleId];
      var outdatedDependencies = {};
      var queue = outdatedModules.map(function (id) {
        return {
          chain: [id],
          id: id
        };
      });

      while (queue.length > 0) {
        var queueItem = queue.pop();
        var moduleId = queueItem.id;
        var chain = queueItem.chain;
        var module = __webpack_require__.c[moduleId];
        if (!module || module.hot._selfAccepted && !module.hot._selfInvalidated) continue;

        if (module.hot._selfDeclined) {
          return {
            type: 'self-declined',
            chain: chain,
            moduleId: moduleId
          };
        }

        if (module.hot._main) {
          return {
            type: 'unaccepted',
            chain: chain,
            moduleId: moduleId
          };
        }

        for (var i = 0; i < module.parents.length; i++) {
          var parentId = module.parents[i];
          var parent = __webpack_require__.c[parentId];
          if (!parent) continue;

          if (parent.hot._declinedDependencies[moduleId]) {
            return {
              type: 'declined',
              chain: chain.concat([parentId]),
              moduleId: moduleId,
              parentId: parentId
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
        outdatedModules: outdatedModules,
        outdatedDependencies: outdatedDependencies
      };
    }

    function addAllToSet(a, b) {
      for (var i = 0; i < b.length; i++) {
        var item = b[i];
        if (a.indexOf(item) === -1) a.push(item);
      }
    } // at begin all updates modules are outdated
    // the "outdated" status can propagate to parents if they don't accept the children


    var outdatedDependencies = {};
    var outdatedModules = [];
    var appliedUpdate = {};

    var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
      console.warn('[HMR] unexpected require(' + module.id + ') to disposed module');
    };

    for (var moduleId in currentUpdate) {
      if (__webpack_require__.o(currentUpdate, moduleId)) {
        var newModuleFactory = currentUpdate[moduleId];
        var result = void 0;

        if (newModuleFactory) {
          result = getAffectedModuleEffects(moduleId);
        } else {
          result = {
            type: 'disposed',
            moduleId: moduleId
          };
        }
        /** @type {Error|false} */


        var abortError = false;
        var doApply = false;
        var doDispose = false;
        var chainInfo = '';

        if (result.chain) {
          chainInfo = '\nUpdate propagation: ' + result.chain.join(' -> ');
        }

        switch (result.type) {
          case 'self-declined':
            if (options.onDeclined) options.onDeclined(result);
            if (!options.ignoreDeclined) abortError = new Error('Aborted because of self decline: ' + result.moduleId + chainInfo);
            break;

          case 'declined':
            if (options.onDeclined) options.onDeclined(result);
            if (!options.ignoreDeclined) abortError = new Error('Aborted because of declined dependency: ' + result.moduleId + ' in ' + result.parentId + chainInfo);
            break;

          case 'unaccepted':
            if (options.onUnaccepted) options.onUnaccepted(result);
            if (!options.ignoreUnaccepted) abortError = new Error('Aborted because ' + moduleId + ' is not accepted' + chainInfo);
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
              addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
            }
          }
        }

        if (doDispose) {
          addAllToSet(outdatedModules, [result.moduleId]);
          appliedUpdate[moduleId] = warnUnexpectedRequire;
        }
      }
    }

    currentUpdate = undefined; // Store self accepted outdated modules to require them later by the module system

    var outdatedSelfAcceptedModules = [];

    for (var j = 0; j < outdatedModules.length; j++) {
      var outdatedModuleId = outdatedModules[j];

      if (__webpack_require__.c[outdatedModuleId] && __webpack_require__.c[outdatedModuleId].hot._selfAccepted // removed self-accepted modules should not be required
      && appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire // when called invalidate self-accepting is not possible
      && !__webpack_require__.c[outdatedModuleId].hot._selfInvalidated) {
        outdatedSelfAcceptedModules.push({
          module: outdatedModuleId,
          require: __webpack_require__.c[outdatedModuleId].hot._requireSelf,
          errorHandler: __webpack_require__.c[outdatedModuleId].hot._selfAccepted
        });
      }
    }

    var moduleOutdatedDependencies;
    return {
      dispose: function dispose() {
        currentUpdateRemovedChunks.forEach(function (chunkId) {
          delete installedChunks[chunkId];
        });
        currentUpdateRemovedChunks = undefined;
        var idx;
        var module;
        var queue = outdatedModules.slice();

        while (queue.length > 0) {
          var _moduleId = queue.pop();

          module = __webpack_require__.c[_moduleId];
          if (!module) continue;
          var data = {}; // Call dispose handlers

          var disposeHandlers = module.hot._disposeHandlers;

          for (var _j = 0; _j < disposeHandlers.length; _j++) {
            disposeHandlers[_j].call(null, data);
          }

          __webpack_require__.hmrD[_moduleId] = data; // disable module (this disables requires from this module)

          module.hot.active = false; // remove module from cache

          delete __webpack_require__.c[_moduleId]; // when disposing there is no need to call dispose handler

          delete outdatedDependencies[_moduleId]; // remove "parents" references from all children

          for (var _j2 = 0; _j2 < module.children.length; _j2++) {
            var child = __webpack_require__.c[module.children[_j2]];
            if (!child) continue;
            idx = child.parents.indexOf(_moduleId);

            if (idx >= 0) {
              child.parents.splice(idx, 1);
            }
          }
        } // remove outdated dependency from module children


        var dependency;

        for (var _outdatedModuleId in outdatedDependencies) {
          if (__webpack_require__.o(outdatedDependencies, _outdatedModuleId)) {
            module = __webpack_require__.c[_outdatedModuleId];

            if (module) {
              moduleOutdatedDependencies = outdatedDependencies[_outdatedModuleId];

              for (var _j3 = 0; _j3 < moduleOutdatedDependencies.length; _j3++) {
                dependency = moduleOutdatedDependencies[_j3];
                idx = module.children.indexOf(dependency);
                if (idx >= 0) module.children.splice(idx, 1);
              }
            }
          }
        }
      },
      apply: function apply(reportError) {
        // insert new code
        for (var updateModuleId in appliedUpdate) {
          if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
            __webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
          }
        } // run new runtime modules


        for (var i = 0; i < currentUpdateRuntime.length; i++) {
          currentUpdateRuntime[i](__webpack_require__);
        } // call accept handlers


        for (var _outdatedModuleId2 in outdatedDependencies) {
          if (__webpack_require__.o(outdatedDependencies, _outdatedModuleId2)) {
            var module = __webpack_require__.c[_outdatedModuleId2];

            if (module) {
              moduleOutdatedDependencies = outdatedDependencies[_outdatedModuleId2];
              var callbacks = [];
              var dependenciesForCallbacks = [];

              for (var _j4 = 0; _j4 < moduleOutdatedDependencies.length; _j4++) {
                var dependency = moduleOutdatedDependencies[_j4];
                var acceptCallback = module.hot._acceptedDependencies[dependency];

                if (acceptCallback) {
                  if (callbacks.indexOf(acceptCallback) !== -1) continue;
                  callbacks.push(acceptCallback);
                  dependenciesForCallbacks.push(dependency);
                }
              }

              for (var k = 0; k < callbacks.length; k++) {
                try {
                  callbacks[k].call(null, moduleOutdatedDependencies);
                } catch (err) {
                  if (options.onErrored) {
                    options.onErrored({
                      type: 'accept-errored',
                      moduleId: _outdatedModuleId2,
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
        } // Load self accepted modules


        for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
          var item = outdatedSelfAcceptedModules[o];
          var _moduleId2 = item.module;

          try {
            item.require(_moduleId2);
          } catch (err) {
            if (typeof item.errorHandler === 'function') {
              try {
                item.errorHandler(err);
              } catch (err2) {
                if (options.onErrored) {
                  options.onErrored({
                    type: 'self-accept-error-handler-errored',
                    moduleId: _moduleId2,
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
                  moduleId: _moduleId2,
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

  __webpack_require__.hmrC.jsonp = function (chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList) {
    applyHandlers.push(applyHandler);
    currentUpdateChunks = {};
    currentUpdateRemovedChunks = removedChunks;
    currentUpdate = removedModules.reduce(function (obj, key) {
      obj[key] = false;
      return obj;
    }, {});
    currentUpdateRuntime = [];
    chunkIds.forEach(function (chunkId) {
      if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId] !== undefined) {
        promises.push(loadUpdateChunk(chunkId, updatedModulesList));
        currentUpdateChunks[chunkId] = true;
      }
    });

    if (__webpack_require__.f) {
      __webpack_require__.f.jsonpHmr = function (chunkId, promises) {
        if (currentUpdateChunks && !__webpack_require__.o(currentUpdateChunks, chunkId) && __webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId] !== undefined) {
          promises.push(loadUpdateChunk(chunkId));
          currentUpdateChunks[chunkId] = true;
        }
      };
    }
  };

  __webpack_require__.hmrM = function (requestTimeout) {
    requestTimeout = requestTimeout || 10000;
    return new Promise( /*#__PURE__*/function () {
      var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
        var requestPath, update;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                requestPath = __webpack_require__.p + __webpack_require__.hmrF();
                _context.prev = 1;
                _context.t0 = JSON;
                _context.next = 5;
                return (0, _fetch["default"])(requestPath, {
                  timeout: requestTimeout
                });

              case 5:
                _context.t1 = _context.sent;
                update = _context.t0.parse.call(_context.t0, _context.t1);
                resolve(webpackVersion >= 5 ? update : undefined);
                _context.next = 15;
                break;

              case 10:
                _context.prev = 10;
                _context.t2 = _context["catch"](1);

                if (!(_context.t2 && _context.t2.xhr && _context.t2.xhr.status === 404)) {
                  _context.next = 14;
                  break;
                }

                return _context.abrupt("return", resolve());

              case 14:
                reject(_context.t2);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 10]]);
      }));

      return function (_x, _x2) {
        return _ref2.apply(this, arguments);
      };
    }());
  };

  var checkDeferredModules = function checkDeferredModules() {};

  function checkDeferredModulesImpl() {
    var result;

    for (var i = 0; i < deferredModules.length; i++) {
      var deferredModule = deferredModules[i];
      var fulfilled = true;

      for (var j = 1; j < deferredModule.length; j++) {
        var depId = deferredModule[j];
        if (installedChunks[depId] !== 0) fulfilled = false;
      }

      if (fulfilled) {
        deferredModules.splice(i--, 1);
        result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
      }
    }

    if (deferredModules.length === 0) {
      __webpack_require__.x();

      __webpack_require__.x = function () {};
    }

    return result;
  } // install a JSONP callback for chunk loading


  function webpackJsonpCallback(data) {
    if (!Array.isArray(data)) return;

    var _data = (0, _slicedToArray2["default"])(data, 4),
        chunkIds = _data[0],
        moreModules = _data[1],
        runtime = _data[2],
        executeModules = _data[3];

    if (webpackVersion < 5) {
      executeModules = runtime;
      runtime = undefined;
    } // add "moreModules" to the modules object,
    // then flag all "chunkIds" as loaded and fire callback


    var moduleId;
    var chunkId;
    var i = 0;
    var resolves = [];

    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];

      if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
        resolves.push(installedChunks[chunkId][0]);
      }

      installedChunks[chunkId] = 0;
    }

    for (moduleId in moreModules) {
      if (__webpack_require__.o(moreModules, moduleId) && !__webpack_require__.o(__webpack_require__.m, moduleId)) {
        __webpack_require__.m[moduleId] = moreModules[moduleId];
      }
    }

    if (runtime) runtime(__webpack_require__);
    parentChunkLoadingFunction(data);

    while (resolves.length) {
      resolves.shift()();
    } // add entry modules from loaded chunk to deferred list


    if (executeModules) deferredModules.push.apply(deferredModules, executeModules); // run deferred modules when all chunks ready

    return checkDeferredModules();
  }
  /** ********************************************************************* */
  // module cache are used so entry inlining is disabled
  // run startup
  // reset startup function so it can be called again when more startup code is added


  __webpack_require__.x = function () {};

  chunkLoadingGlobal = chunkLoadingGlobal.slice();

  for (var i = 0; i < chunkLoadingGlobal.length; i++) {
    webpackJsonpCallback(chunkLoadingGlobal[i]);
  }

  (checkDeferredModules = checkDeferredModulesImpl)();
  return __webpack_require__;
}

var _default = createRuntime;
exports["default"] = _default;