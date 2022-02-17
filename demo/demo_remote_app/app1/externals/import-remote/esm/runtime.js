"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.assign");

var _utils = require("./utils");

var _importCss = _interopRequireDefault(require("./importCss"));

var _importJs = _interopRequireDefault(require("./importJs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function createRuntime() {
  var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$jsonpFunction = _ref.jsonpFunction,
      jsonpFunction = _ref$jsonpFunction === void 0 ? 'webpackJsonp' : _ref$jsonpFunction,
      _ref$publicPath = _ref.publicPath,
      publicPath = _ref$publicPath === void 0 ? '' : _ref$publicPath,
      _ref$host = _ref.host,
      host = _ref$host === void 0 ? '' : _ref$host,
      _ref$devtool = _ref.devtool,
      devtool = _ref$devtool === void 0 ? false : _ref$devtool,
      _ref$hot = _ref.hot,
      hot = _ref$hot === void 0 ? false : _ref$hot,
      _ref$hash = _ref.hash,
      hash = _ref$hash === void 0 ? '' : _ref$hash,
      _ref$scopeName = _ref.scopeName,
      scopeName = _ref$scopeName === void 0 ? '' : _ref$scopeName,
      _ref$cssChunks = _ref.cssChunks,
      cssChunks = _ref$cssChunks === void 0 ? {} : _ref$cssChunks,
      _ref$jsChunks = _ref.jsChunks,
      jsChunks = _ref$jsChunks === void 0 ? {} : _ref$jsChunks,
      _ref$context = _ref.context,
      context = _ref$context === void 0 ? {} : _ref$context,
      _ref$cached = _ref.cached,
      cached = _ref$cached === void 0 ? _utils.globalCached : _ref$cached,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? _utils.DEFAULT_TIMEOUT : _ref$timeout,
      requireExternal = _ref.requireExternal,
      beforeSource = _ref.beforeSource;

  var _hasOwnProperty = Object.prototype.hasOwnProperty; // The module cache

  context.installedModules = context.installedModules || {}; // object to store loaded CSS chunks

  context.installedCssChunks = context.installedCssChunks || {}; // object to store loaded and loading chunks
  // undefined = chunk not loaded, null = chunk preloaded/prefetched
  // Promise = chunk loading, 0 = chunk loaded

  context.installedChunks = context.installedChunks || {};
  context.deferredModules = context.deferredModules || [];
  if (!window.__moduleWebpack__) window.__moduleWebpack__ = {};
  var jsonpArray = context[jsonpFunction] = context[jsonpFunction] || [];
  var oldJsonpFunction = jsonpArray.push.bind(jsonpArray); // eslint-disable-next-line no-use-before-define

  jsonpArray.push = webpackJsonpCallback;
  jsonpArray = jsonpArray.slice(); // eslint-disable-next-line no-use-before-define

  for (var i = 0; i < jsonpArray.length; i++) {
    webpackJsonpCallback(jsonpArray[i]);
  }

  context.parentJsonpFunction = oldJsonpFunction; // The require function

  function __webpack_require__(moduleId, entryFile) {
    if (!modules[moduleId] && entryFile && modules[entryFile]) moduleId = entryFile; // if (Array.isArray(moduleId)) {
    //   moduleId = moduleId.find(id => id && modules[id]);
    // }
    // Check if module is in cache

    if (context.installedModules[moduleId]) {
      return context.installedModules[moduleId].exports;
    }

    if (!modules[moduleId]) {
      var result = requireExternal(moduleId);
      if (result !== undefined) return result;
      throw new Error("[import-remote]module[".concat(moduleId, "] not exist!"));
    } // Create a new module (and put it into the cache)


    var module = context.installedModules[moduleId] = {
      inRemoteModule: true,
      requireExternal: requireExternal,
      publicPath: publicPath,
      i: moduleId,
      l: false,
      exports: {}
    };

    if (hot) {
      Object.assign(module, {
        hot: hotCreateModule(moduleId),
        parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
        children: []
      });
    } // Execute the module function


    try {
      modules[moduleId].call(module.exports, module, module.exports, hot ? hotCreateRequire(moduleId) : __webpack_require__);
    } catch (ex) {
      console.error(ex);
      throw ex;
    } // Flag the module as loaded


    module.l = true; // Return the exports of the module

    return module.exports;
  }

  var hotApplyOnUpdate = true;
  var hotCurrentHash = hash;
  var hotRequestTimeout = 10000;
  var hotCurrentModuleData = {};
  var hotCurrentChildModule;
  var hotCurrentParents = [];
  var hotCurrentParentsTemp = []; // __webpack_hash__

  __webpack_require__.h = function () {
    return hotCurrentHash;
  };

  function hotDisposeChunk(chunkId) {
    delete context.installedChunks[chunkId];
  }

  var parentHotUpdateCallback = context.webpackHotUpdate;

  context.webpackHotUpdate = function webpackHotUpdateCallback(chunkId, moreModules) {
    hotAddUpdateChunk(chunkId, moreModules);
    if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
  };

  function hotDownloadUpdateChunk(chunkId) {
    var href = __webpack_require__.p + '' + chunkId + '.' + hotCurrentHash + '.hot-update.js';
    return (0, _importJs.default)(href, {
      timeout: timeout,
      global: context,
      cached: cached,
      scopeName: scopeName,
      host: host,
      devtool: devtool,
      beforeSource: beforeSource
    });
  }

  function hotDownloadManifest(requestTimeout) {
    requestTimeout = requestTimeout || 10000;
    return new Promise( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
        var requestPath, update;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                requestPath = __webpack_require__.p + '' + hotCurrentHash + '.hot-update.json';
                _context.prev = 1;
                _context.t0 = JSON;
                _context.next = 5;
                return (0, _utils.fetch)(requestPath);

              case 5:
                _context.t1 = _context.sent;
                update = _context.t0.parse.call(_context.t0, _context.t1);
                resolve(update);
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
  }

  function hotCreateRequire(moduleId) {
    var me = context.installedModules[moduleId];
    if (!me) return __webpack_require__;

    var fn = function fn(request) {
      if (me.hot.active) {
        if (context.installedModules[request]) {
          if (context.installedModules[request].parents.indexOf(moduleId) === -1) {
            context.installedModules[request].parents.push(moduleId);
          }
        } else {
          hotCurrentParents = [moduleId];
          hotCurrentChildModule = request;
        }

        if (me.children.indexOf(request) === -1) {
          me.children.push(request);
        }
      } else {
        console.warn('[HMR] unexpected require(' + request + ') from disposed module ' + moduleId);
        hotCurrentParents = [];
      }

      return __webpack_require__(request);
    };

    var ObjectFactory = function ObjectFactory(name) {
      return {
        configurable: true,
        enumerable: true,
        get: function get() {
          return __webpack_require__[name];
        },
        set: function set(value) {
          __webpack_require__[name] = value;
        }
      };
    };

    for (var name in __webpack_require__) {
      if (_hasOwnProperty.call(__webpack_require__, name) && name !== 'e' && name !== 't') {
        Object.defineProperty(fn, name, ObjectFactory(name));
      }
    }

    fn.e = function (chunkId) {
      if (hotStatus === 'ready') hotSetStatus('prepare');
      hotChunksLoading++;
      return __webpack_require__.e(chunkId).then(finishChunkLoading, function (err) {
        finishChunkLoading();
        throw err;
      });

      function finishChunkLoading() {
        hotChunksLoading--;

        if (hotStatus === 'prepare') {
          if (!hotWaitingFilesMap[chunkId]) {
            hotEnsureUpdateChunk(chunkId);
          }

          if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
            hotUpdateDownloaded();
          }
        }
      }
    };

    fn.t = function (value, mode) {
      if (mode & 1) value = fn(value);
      return __webpack_require__.t(value, mode & ~1);
    };

    return fn;
  } // eslint-disable-next-line no-unused-vars


  function hotCreateModule(moduleId) {
    var hot = {
      // private stuff
      _acceptedDependencies: {},
      _declinedDependencies: {},
      _selfAccepted: false,
      _selfDeclined: false,
      _selfInvalidated: false,
      _disposeHandlers: [],
      _main: hotCurrentChildModule !== moduleId,
      // Module API
      active: true,
      accept: function accept(dep, callback) {
        if (dep === undefined) hot._selfAccepted = true;else if (typeof dep === 'function') hot._selfAccepted = dep;else if (_typeof(dep) === 'object') for (var _i = 0; _i < dep.length; _i++) {
          hot._acceptedDependencies[dep[_i]] = callback || function () {};
        } else hot._acceptedDependencies[dep] = callback || function () {};
      },
      decline: function decline(dep) {
        if (dep === undefined) hot._selfDeclined = true;else if (_typeof(dep) === 'object') for (var _i2 = 0; _i2 < dep.length; _i2++) {
          hot._declinedDependencies[dep[_i2]] = true;
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

        switch (hotStatus) {
          case 'idle':
            hotUpdate = {};
            hotUpdate[moduleId] = modules[moduleId];
            hotSetStatus('ready');
            break;

          case 'ready':
            hotApplyInvalidatedModule(moduleId);
            break;

          case 'prepare':
          case 'check':
          case 'dispose':
          case 'apply':
            (hotQueuedInvalidatedModules = hotQueuedInvalidatedModules || []).push(moduleId);
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
        if (!l) return hotStatus;
        hotStatusHandlers.push(l);
      },
      addStatusHandler: function addStatusHandler(l) {
        hotStatusHandlers.push(l);
      },
      removeStatusHandler: function removeStatusHandler(l) {
        var idx = hotStatusHandlers.indexOf(l);
        if (idx >= 0) hotStatusHandlers.splice(idx, 1);
      },
      // inherit from previous dispose call
      data: hotCurrentModuleData[moduleId]
    };
    hotCurrentChildModule = undefined;
    return hot;
  }

  var hotStatusHandlers = [];
  var hotStatus = 'idle';

  function hotSetStatus(newStatus) {
    hotStatus = newStatus;

    for (var _i3 = 0; _i3 < hotStatusHandlers.length; _i3++) {
      hotStatusHandlers[_i3].call(null, newStatus);
    }
  } // while downloading


  var hotWaitingFiles = 0;
  var hotChunksLoading = 0;
  var hotWaitingFilesMap = {};
  var hotRequestedFilesMap = {};
  var hotAvailableFilesMap = {};
  var hotDeferred; // The update info

  var hotUpdate;
  var hotUpdateNewHash;
  var hotQueuedInvalidatedModules;

  function toModuleId(id) {
    var isNumber = +id + '' === id;
    return isNumber ? +id : id;
  }

  function hotCheck(apply) {
    if (hotStatus !== 'idle') {
      throw new Error('check() is only allowed in idle status');
    }

    hotApplyOnUpdate = apply;
    hotSetStatus('check');
    return hotDownloadManifest(hotRequestTimeout).then(function (update) {
      if (!update) {
        hotSetStatus(hotApplyInvalidatedModules() ? 'ready' : 'idle');
        return null;
      }

      hotRequestedFilesMap = {};
      hotWaitingFilesMap = {};
      hotAvailableFilesMap = update.c;
      hotUpdateNewHash = update.h;
      hotSetStatus('prepare');
      var promise = new Promise(function (resolve, reject) {
        hotDeferred = {
          resolve: resolve,
          reject: reject
        };
      });
      hotUpdate = {}; // eslint-disable-next-line guard-for-in

      for (var chunkId in context.installedChunks) {
        hotEnsureUpdateChunk(chunkId);
      }

      if (hotStatus === 'prepare' && hotChunksLoading === 0 && hotWaitingFiles === 0) {
        hotUpdateDownloaded();
      }

      return promise;
    });
  }

  function hotAddUpdateChunk(chunkId, moreModules) {
    if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId]) return;
    hotRequestedFilesMap[chunkId] = false;

    for (var moduleId in moreModules) {
      if (_hasOwnProperty.call(moreModules, moduleId)) {
        hotUpdate[moduleId] = moreModules[moduleId];
      }
    }

    if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
      hotUpdateDownloaded();
    }
  }

  function hotEnsureUpdateChunk(chunkId) {
    if (!hotAvailableFilesMap[chunkId]) {
      hotWaitingFilesMap[chunkId] = true;
    } else {
      hotRequestedFilesMap[chunkId] = true;
      hotWaitingFiles++;
      hotDownloadUpdateChunk(chunkId);
    }
  }

  function hotUpdateDownloaded() {
    hotSetStatus('ready');
    var deferred = hotDeferred;
    hotDeferred = null;
    if (!deferred) return;

    if (hotApplyOnUpdate) {
      // Wrap deferred object in Promise to mark it as a well-handled Promise to
      // avoid triggering uncaught exception warning in Chrome.
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
      Promise.resolve().then(function () {
        return hotApply(hotApplyOnUpdate);
      }).then(function (result) {
        deferred.resolve(result);
      }, function (err) {
        deferred.reject(err);
      });
    } else {
      var outdatedModules = [];

      for (var id in hotUpdate) {
        if (_hasOwnProperty.call(hotUpdate, id)) {
          outdatedModules.push(toModuleId(id));
        }
      }

      deferred.resolve(outdatedModules);
    }
  }

  function hotApply(options) {
    if (hotStatus !== 'ready') throw new Error('apply() is only allowed in ready status');
    options = options || {};
    return hotApplyInternal(options);
  }

  function hotApplyInternal(options) {
    hotApplyInvalidatedModules();
    var cb;
    var i;
    var j;
    var module;
    var moduleId;

    function getAffectedStuff(updateModuleId) {
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
        var _moduleId = queueItem.id;
        var chain = queueItem.chain;
        module = context.installedModules[_moduleId];
        if (!module || module.hot._selfAccepted && !module.hot._selfInvalidated) continue;

        if (module.hot._selfDeclined) {
          return {
            type: 'self-declined',
            chain: chain,
            moduleId: _moduleId
          };
        }

        if (module.hot._main) {
          return {
            type: 'unaccepted',
            chain: chain,
            moduleId: _moduleId
          };
        }

        for (var _i4 = 0; _i4 < module.parents.length; _i4++) {
          var parentId = module.parents[_i4];
          var parent = context.installedModules[parentId];
          if (!parent) continue;

          if (parent.hot._declinedDependencies[_moduleId]) {
            return {
              type: 'declined',
              chain: chain.concat([parentId]),
              moduleId: _moduleId,
              parentId: parentId
            };
          }

          if (outdatedModules.indexOf(parentId) !== -1) continue;

          if (parent.hot._acceptedDependencies[_moduleId]) {
            if (!outdatedDependencies[parentId]) outdatedDependencies[parentId] = [];
            addAllToSet(outdatedDependencies[parentId], [_moduleId]);
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
      for (var _i5 = 0; _i5 < b.length; _i5++) {
        var item = b[_i5];
        if (a.indexOf(item) === -1) a.push(item);
      }
    } // at begin all updates modules are outdated
    // the "outdated" status can propagate to parents if they don't accept the children


    var outdatedDependencies = {};
    var outdatedModules = [];
    var appliedUpdate = {};
    var result;

    var warnUnexpectedRequire = function warnUnexpectedRequire() {
      console.warn('[HMR] unexpected require(' + result.moduleId + ') to disposed module');
    };

    for (var id in hotUpdate) {
      if (_hasOwnProperty.call(hotUpdate, id)) {
        moduleId = toModuleId(id);

        if (hotUpdate[id]) {
          result = getAffectedStuff(moduleId);
        } else {
          result = {
            type: 'disposed',
            moduleId: id
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
          hotSetStatus('abort');
          return Promise.reject(abortError);
        }

        if (doApply) {
          appliedUpdate[moduleId] = hotUpdate[moduleId];
          addAllToSet(outdatedModules, result.outdatedModules);

          for (moduleId in result.outdatedDependencies) {
            if (_hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
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
    } // Store self accepted outdated modules to require them later by the module system


    var outdatedSelfAcceptedModules = [];

    for (i = 0; i < outdatedModules.length; i++) {
      moduleId = outdatedModules[i];

      if (context.installedModules[moduleId] && context.installedModules[moduleId].hot._selfAccepted // removed self-accepted modules should not be required
      && appliedUpdate[moduleId] !== warnUnexpectedRequire // when called invalidate self-accepting is not possible
      && !context.installedModules[moduleId].hot._selfInvalidated) {
        outdatedSelfAcceptedModules.push({
          module: moduleId,
          parents: context.installedModules[moduleId].parents.slice(),
          errorHandler: context.installedModules[moduleId].hot._selfAccepted
        });
      }
    } // Now in "dispose" phase


    hotSetStatus('dispose');
    Object.keys(hotAvailableFilesMap).forEach(function (chunkId) {
      if (hotAvailableFilesMap[chunkId] === false) {
        hotDisposeChunk(chunkId);
      }
    });
    var idx;
    var queue = outdatedModules.slice();

    while (queue.length > 0) {
      moduleId = queue.pop();
      module = context.installedModules[moduleId];
      if (!module) continue;
      var data = {}; // Call dispose handlers

      var disposeHandlers = module.hot._disposeHandlers;

      for (j = 0; j < disposeHandlers.length; j++) {
        cb = disposeHandlers[j];
        cb(data);
      }

      hotCurrentModuleData[moduleId] = data; // disable module (this disables requires from this module)

      module.hot.active = false; // remove module from cache

      delete context.installedModules[moduleId]; // when disposing there is no need to call dispose handler

      delete outdatedDependencies[moduleId]; // remove "parents" references from all children

      for (j = 0; j < module.children.length; j++) {
        var child = context.installedModules[module.children[j]];
        if (!child) continue;
        idx = child.parents.indexOf(moduleId);

        if (idx >= 0) {
          child.parents.splice(idx, 1);
        }
      }
    } // remove outdated dependency from module children


    var dependency;
    var moduleOutdatedDependencies;

    for (moduleId in outdatedDependencies) {
      if (_hasOwnProperty.call(outdatedDependencies, moduleId)) {
        module = context.installedModules[moduleId];

        if (module) {
          moduleOutdatedDependencies = outdatedDependencies[moduleId];

          for (j = 0; j < moduleOutdatedDependencies.length; j++) {
            dependency = moduleOutdatedDependencies[j];
            idx = module.children.indexOf(dependency);
            if (idx >= 0) module.children.splice(idx, 1);
          }
        }
      }
    } // Now in "apply" phase


    hotSetStatus('apply');

    if (hotUpdateNewHash !== undefined) {
      hotCurrentHash = hotUpdateNewHash;
      hotUpdateNewHash = undefined;
    }

    hotUpdate = undefined; // insert new code

    for (moduleId in appliedUpdate) {
      if (_hasOwnProperty.call(appliedUpdate, moduleId)) {
        modules[moduleId] = appliedUpdate[moduleId];
      }
    } // call accept handlers


    var error = null;

    for (moduleId in outdatedDependencies) {
      if (_hasOwnProperty.call(outdatedDependencies, moduleId)) {
        module = context.installedModules[moduleId];

        if (module) {
          moduleOutdatedDependencies = outdatedDependencies[moduleId];
          var callbacks = [];

          for (i = 0; i < moduleOutdatedDependencies.length; i++) {
            dependency = moduleOutdatedDependencies[i];
            cb = module.hot._acceptedDependencies[dependency];

            if (cb) {
              if (callbacks.indexOf(cb) !== -1) continue;
              callbacks.push(cb);
            }
          }

          for (i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];

            try {
              cb(moduleOutdatedDependencies);
            } catch (err) {
              if (options.onErrored) {
                options.onErrored({
                  type: 'accept-errored',
                  moduleId: moduleId,
                  dependencyId: moduleOutdatedDependencies[i],
                  error: err
                });
              }

              if (!options.ignoreErrored) {
                if (!error) error = err;
              }
            }
          }
        }
      }
    } // Load self accepted modules


    for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
      var item = outdatedSelfAcceptedModules[i];
      moduleId = item.module;
      hotCurrentParents = item.parents;
      hotCurrentChildModule = moduleId;

      try {
        __webpack_require__(moduleId);
      } catch (err) {
        if (typeof item.errorHandler === 'function') {
          try {
            item.errorHandler(err);
          } catch (err2) {
            if (options.onErrored) {
              options.onErrored({
                type: 'self-accept-error-handler-errored',
                moduleId: moduleId,
                error: err2,
                originalError: err
              });
            }

            if (!options.ignoreErrored) {
              if (!error) error = err2;
            }

            if (!error) error = err;
          }
        } else {
          if (options.onErrored) {
            options.onErrored({
              type: 'self-accept-errored',
              moduleId: moduleId,
              error: err
            });
          }

          if (!options.ignoreErrored) {
            if (!error) error = err;
          }
        }
      }
    } // handle errors in accept handlers and self accepted module load


    if (error) {
      hotSetStatus('fail');
      return Promise.reject(error);
    }

    if (hotQueuedInvalidatedModules) {
      return hotApplyInternal(options).then(function (list) {
        outdatedModules.forEach(function (moduleId) {
          if (list.indexOf(moduleId) < 0) list.push(moduleId);
        });
        return list;
      });
    }

    hotSetStatus('idle');
    return new Promise(function (resolve) {
      resolve(outdatedModules);
    });
  }

  function hotApplyInvalidatedModules() {
    if (hotQueuedInvalidatedModules) {
      if (!hotUpdate) hotUpdate = {};
      hotQueuedInvalidatedModules.forEach(hotApplyInvalidatedModule);
      hotQueuedInvalidatedModules = undefined;
      return true;
    }
  }

  function hotApplyInvalidatedModule(moduleId) {
    if (!_hasOwnProperty.call(hotUpdate, moduleId)) hotUpdate[moduleId] = modules[moduleId];
  } // This file contains only the entry chunk.
  // The chunk loading function for additional chunks


  __webpack_require__.e = function requireEnsure(chunkId) {
    var promises = []; // mini-css-extract-plugin CSS loading

    if (context.installedCssChunks[chunkId]) promises.push(context.installedCssChunks[chunkId]);else if (context.installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {
      promises.push(context.installedCssChunks[chunkId] = new Promise(function (resolve, reject) {
        var href = __webpack_require__.p + cssChunks[chunkId];
        (0, _importCss.default)(href, {
          timeout: timeout,
          head: context.__windowProxy__.doc.head,
          scopeName: scopeName,
          host: host,
          devtool: devtool,
          beforeSource: beforeSource,
          cached: cached
        }).then(resolve).catch(function (err) {
          delete context.installedCssChunks[chunkId];
          reject(err);
        });
      }).then(function () {
        context.installedCssChunks[chunkId] = 0;
      }));
    } else {} // console.warn('[import-remote:CSS_CHUNK_LOAD_FAILED] chunkId:' + chunkId + ' not found!');
    // js chunk loading

    var installedChunkData = context.installedChunks[chunkId];

    if (installedChunkData !== 0) {
      // 0 means "already installed".
      // a Promise means "currently loading".
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        // setup Promise in chunk cache
        var promise = new Promise(function (resolve, reject) {
          installedChunkData = context.installedChunks[chunkId] = [resolve, reject];
        });
        promises.push(installedChunkData[2] = promise);
        var prom;
        var jsChunk = jsChunks[chunkId];

        if (Array.isArray(jsChunk)) {
          prom = Promise.all(jsChunk.map(function (v) {
            return (0, _importJs.default)(__webpack_require__.p + v, {
              timeout: timeout,
              global: context,
              cached: cached,
              scopeName: scopeName,
              host: host,
              devtool: devtool,
              beforeSource: beforeSource
            });
          })).then(function (results) {
            return results[0];
          });
        } else prom = (0, _importJs.default)(__webpack_require__.p + jsChunk, {
          timeout: timeout,
          global: context,
          cached: cached,
          scopeName: scopeName,
          host: host,
          devtool: devtool,
          beforeSource: beforeSource
        });

        prom.then(function (result) {
          var chunk = context.installedChunks[chunkId];
          if (Array.isArray(chunk)) chunk[0](result);else if (installedChunkData) installedChunkData[0](result);
        }).catch(function (event) {
          var chunk = context.installedChunks[chunkId];
          var errorMessage = event && event.message;
          var url = event && event.url;
          var errorType = event && (event.type === 'load' ? 'missing' : event.type);
          var error = new Error(errorMessage || 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + (url ? ': ' + url : '') + ')');
          error.code = 'JS_CHUNK_LOAD_FAILED';
          error.type = errorType;
          error.request = url;
          if (Array.isArray(chunk)) chunk[1](error);
          context.installedChunks[chunkId] = undefined;
        });
      }
    }

    return Promise.all(promises);
  }; // expose the modules object (__webpack_modules__)


  __webpack_require__.m = modules; // expose the module cache

  __webpack_require__.c = context.installedModules; // define getter function for harmony exports

  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, {
        enumerable: true,
        get: getter
      });
    }
  }; // define __esModule on exports


  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: 'Module'
      });
    }

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
  }; // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 8|1: behave like require


  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = __webpack_require__(value);
    if (mode & 8) return value;
    if (mode & 4 && _typeof(value) === 'object' && value && value.__esModule) return value;
    var ns = Object.create(null);

    __webpack_require__.r(ns);

    Object.defineProperty(ns, 'default', {
      enumerable: true,
      value: value
    });

    if (mode & 2 && typeof value != 'string') {
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (var key in value) {
        __webpack_require__.d(ns, key, function (key) {
          return value[key];
        }.bind(null, key));
      }
    }

    return ns;
  }; // getDefaultExport function for compatibility with non-harmony modules


  __webpack_require__.n = function (module) {
    var getter = module && module.__esModule ? function getDefault() {
      return module.default;
    } : function getModuleExports() {
      return module;
    };

    __webpack_require__.d(getter, 'a', getter);

    return getter;
  }; // _hasOwnProperty.call


  __webpack_require__.o = function (object, property) {
    return _hasOwnProperty.call(object, property);
  }; // __webpack_public_path__


  __webpack_require__.p = (0, _utils.joinUrl)(host, publicPath); // on error function for async loading

  __webpack_require__.oe = function (err) {
    console.error(err);
    throw err;
  };

  function checkDeferredModules() {
    var result;

    for (var _i6 = 0; _i6 < context.deferredModules.length; _i6++) {
      var deferredModule = context.deferredModules[_i6];
      var fulfilled = true;

      for (var j = 1; j < deferredModule.length; j++) {
        var depId = deferredModule[j];
        if (context.installedChunks[depId] !== 0) fulfilled = false;
      }

      if (fulfilled) {
        context.deferredModules.splice(_i6--, 1);
        result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
      }
    }

    return result;
  } // install a JSONP callback for chunk loading


  function webpackJsonpCallback(data) {
    var chunkIds = data[0];
    var moreModules = data[1];
    var executeModules = data[2]; // add "moreModules" to the modules object,
    // then flag all "chunkIds" as loaded and fire callback

    var chunkId;
    var i = 0;
    var resolves = [];

    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];

      if (_hasOwnProperty.call(context.installedChunks, chunkId) && context.installedChunks[chunkId]) {
        resolves.push(context.installedChunks[chunkId][0]);
      }

      context.installedChunks[chunkId] = 0;
    }

    Object.keys(moreModules).forEach(function (moduleId) {
      if (_hasOwnProperty.call(moreModules, moduleId) && (hot || !modules[moduleId])) {
        modules[moduleId] = moreModules[moduleId];
      }
    });
    if (context.parentJsonpFunction) context.parentJsonpFunction(data);

    while (resolves.length) {
      resolves.shift()();
    } // add entry modules from loaded chunk to deferred list
    // eslint-disable-next-line prefer-spread


    context.deferredModules.push.apply(context.deferredModules, executeModules || []); // run deferred modules when all chunks ready

    return checkDeferredModules();
  } // run deferred modules from other chunks


  checkDeferredModules();
  return __webpack_require__;
}

var _default = createRuntime;
exports.default = _default;