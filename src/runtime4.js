/* eslint-disable camelcase */
import fetch, { globalCached, objectDefineProperty } from './fetch';
import { DEFAULT_TIMEOUT, joinUrl } from './utils';
import importCss from './importCss';
import importJs from './importJs';

function createRuntime({
  jsonpFunction = 'webpackJsonp',
  publicPath = '',
  host = '',
  devtool = false,
  hot = false,
  hash = '',
  scopeName = '',
  cssChunks = {},
  jsChunks = {},
  context = {},
  cached = globalCached,
  timeout = DEFAULT_TIMEOUT,
  requireExternal,
  beforeSource,
} = {}) {
  const modules = [];
  
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  // The module cache
  context.installedModules = context.installedModules || {};

  // object to store loaded CSS chunks
  context.installedCssChunks = context.installedCssChunks || { };

  // object to store loaded and loading chunks
  // undefined = chunk not loaded, null = chunk preloaded/prefetched
  // Promise = chunk loading, 0 = chunk loaded
  context.installedChunks =  context.installedChunks || { };

  context.deferredModules = context.deferredModules || [];

  if (!window.__moduleWebpack__) window.__moduleWebpack__ = {};

  let jsonpArray = context[jsonpFunction] = context[jsonpFunction] || [];
  let oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
  // eslint-disable-next-line no-use-before-define
  jsonpArray.push = webpackJsonpCallback;
  jsonpArray = jsonpArray.slice();
  // eslint-disable-next-line no-use-before-define
  for (let i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
  context.parentJsonpFunction = oldJsonpFunction;

  // The require function
  function __webpack_require__(moduleId, entryFile) {
    if (!modules[moduleId] && entryFile && modules[entryFile]) moduleId = entryFile;
    // if (Array.isArray(moduleId)) {
    //   moduleId = moduleId.find(id => id && modules[id]);
    // }
    // Check if module is in cache
    if (context.installedModules[moduleId]) {
      return context.installedModules[moduleId].exports;
    }
    if (!modules[moduleId]) {
      let result = requireExternal(moduleId);
      if (result !== undefined) return result;

      throw new Error(`[import-remote]module[${moduleId}] not exist!`);
    }

    // Create a new module (and put it into the cache)
    let module = context.installedModules[moduleId] = {
      inRemoteModule: true,
      requireExternal,
      publicPath,
      
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
    }

    // Execute the module function
    try {
      modules[moduleId].call(
        module.exports, 
        module, 
        module.exports, 
        hot ? hotCreateRequire(moduleId) : __webpack_require__
      );
    } catch (ex) {
      console.error(ex);
      throw ex;
    }

    // Flag the module as loaded
    module.l = true;

    // Return the exports of the module
    return module.exports;
  }

  let hotApplyOnUpdate = true;
  let hotCurrentHash = hash;
  let hotRequestTimeout = 10000;
  let hotCurrentModuleData = {};
  let hotCurrentChildModule;
  let hotCurrentParents = [];
  let hotCurrentParentsTemp = [];

  // __webpack_hash__
  __webpack_require__.h = function () { return hotCurrentHash; };

  function hotDisposeChunk(chunkId) {
    delete context.installedChunks[chunkId];
  }
  let parentHotUpdateCallback = context.webpackHotUpdate;
  context.webpackHotUpdate = function webpackHotUpdateCallback(chunkId, moreModules) {
    hotAddUpdateChunk(chunkId, moreModules);
    if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
  };
  
  function hotDownloadUpdateChunk(chunkId) {
    let href = __webpack_require__.p + '' + chunkId + '.' + hotCurrentHash + '.hot-update.js';
    return importJs(href, {  timeout, global: context, cached, scopeName, host, devtool, beforeSource });
  }                          
  
  function hotDownloadManifest(requestTimeout) {
    requestTimeout = requestTimeout || 10000;
    return new Promise(async function (resolve, reject) {
      const requestPath = __webpack_require__.p + '' + hotCurrentHash + '.hot-update.json';
      try {
        let update = JSON.parse(await fetch(requestPath, { timeout: requestTimeout }));
        resolve(update);
      } catch (e) {
        if (e && e.xhr && e.xhr.status === 404) return resolve();
        reject(e);
      }
    });
  }

  function hotCreateRequire(moduleId) {
    let me = context.installedModules[moduleId];
    if (!me) return __webpack_require__;
    let fn = function (request) {
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
    let ObjectFactory = function ObjectFactory(name) {
      return {
        configurable: true,
        enumerable: true,
        get() {
          return __webpack_require__[name];
        },
        set(value) {
          __webpack_require__[name] = value;
        }
      };
    };
    for (let name in __webpack_require__) {
      if (
        _hasOwnProperty.call(__webpack_require__, name)
        && name !== 'e'
        && name !== 't') {
        objectDefineProperty(fn, name, ObjectFactory(name));
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
  }
  
  // eslint-disable-next-line no-unused-vars
  function hotCreateModule(moduleId) {
    const hot = {
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
      accept(dep, callback) {
        if (dep === undefined) hot._selfAccepted = true;
        else if (typeof dep === 'function') hot._selfAccepted = dep;
        else if (typeof dep === 'object') for (let i = 0; i < dep.length; i++) hot._acceptedDependencies[dep[i]] = callback || function () {};
        else hot._acceptedDependencies[dep] = callback || function () {};
      },
      decline(dep) {
        if (dep === undefined) hot._selfDeclined = true;
        else if (typeof dep === 'object') for (let i = 0; i < dep.length; i++) hot._declinedDependencies[dep[i]] = true;
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
            (hotQueuedInvalidatedModules
              = hotQueuedInvalidatedModules || []).push(moduleId);
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
        if (!l) return hotStatus;
        hotStatusHandlers.push(l);
      },
      addStatusHandler(l) {
        hotStatusHandlers.push(l);
      },
      removeStatusHandler(l) {
        let idx = hotStatusHandlers.indexOf(l);
        if (idx >= 0) hotStatusHandlers.splice(idx, 1);
      },
  
      // inherit from previous dispose call
      data: hotCurrentModuleData[moduleId]
    };
    hotCurrentChildModule = undefined;
    return hot;
  }
  
  let hotStatusHandlers = [];
  let hotStatus = 'idle';
  
  function hotSetStatus(newStatus) {
    hotStatus = newStatus;
    for (let i = 0; i < hotStatusHandlers.length; i++) hotStatusHandlers[i].call(null, newStatus);
  }
  
  // while downloading
  let hotWaitingFiles = 0;
  let hotChunksLoading = 0;
  let hotWaitingFilesMap = {};
  let hotRequestedFilesMap = {};
  let hotAvailableFilesMap = {};
  let hotDeferred;
  
  // The update info
  let hotUpdate; let hotUpdateNewHash; let hotQueuedInvalidatedModules;
  
  function toModuleId(id) {
    let isNumber = +id + '' === id;
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
      let promise = new Promise(function (resolve, reject) {
        hotDeferred = {
          resolve,
          reject
        };
      });
      hotUpdate = {};
      // eslint-disable-next-line guard-for-in
      for (let chunkId in context.installedChunks) {
        hotEnsureUpdateChunk(chunkId);
      }
      if (
        hotStatus === 'prepare'
        && hotChunksLoading === 0
        && hotWaitingFiles === 0) {
        hotUpdateDownloaded();
      }
      return promise;
    });
  }
  
  function hotAddUpdateChunk(chunkId, moreModules) {
    if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId]) return;
    hotRequestedFilesMap[chunkId] = false;
    for (let moduleId in moreModules) {
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
    let deferred = hotDeferred;
    hotDeferred = null;
    if (!deferred) return;
    if (hotApplyOnUpdate) {
      // Wrap deferred object in Promise to mark it as a well-handled Promise to
      // avoid triggering uncaught exception warning in Chrome.
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
      Promise.resolve()
        .then(function () {
          return hotApply(hotApplyOnUpdate);
        })
        .then(
          function (result) {
            deferred.resolve(result);
          },
          function (err) {
            deferred.reject(err);
          }
        );
    } else {
      let outdatedModules = [];
      for (let id in hotUpdate) {
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
  
    let cb;
    let i;
    let j;
    let module;
    let moduleId;
  
    function getAffectedStuff(updateModuleId) {
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
        module = context.installedModules[moduleId];
        if (
          !module
          || (module.hot._selfAccepted && !module.hot._selfInvalidated)) continue;
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
          let parent = context.installedModules[parentId];
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
    let result;

    let warnUnexpectedRequire = function warnUnexpectedRequire() {
      console.warn(
        '[HMR] unexpected require(' + result.moduleId + ') to disposed module'
      );
    };
  
    for (let id in hotUpdate) {
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
          hotSetStatus('abort');
          return Promise.reject(abortError);
        }
        if (doApply) {
          appliedUpdate[moduleId] = hotUpdate[moduleId];
          addAllToSet(outdatedModules, result.outdatedModules);
          for (moduleId in result.outdatedDependencies) {
            if (
              _hasOwnProperty.call(
                result.outdatedDependencies,
                moduleId
              )) {
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
  
    // Store self accepted outdated modules to require them later by the module system
    let outdatedSelfAcceptedModules = [];
    for (i = 0; i < outdatedModules.length; i++) {
      moduleId = outdatedModules[i];
      if (
        context.installedModules[moduleId]
        && context.installedModules[moduleId].hot._selfAccepted
        // removed self-accepted modules should not be required
        && appliedUpdate[moduleId] !== warnUnexpectedRequire
        // when called invalidate self-accepting is not possible
        && !context.installedModules[moduleId].hot._selfInvalidated) {
        outdatedSelfAcceptedModules.push({
          module: moduleId,
          parents: context.installedModules[moduleId].parents.slice(),
          errorHandler: context.installedModules[moduleId].hot._selfAccepted
        });
      }
    }
  
    // Now in "dispose" phase
    hotSetStatus('dispose');
    Object.keys(hotAvailableFilesMap).forEach(function (chunkId) {
      if (hotAvailableFilesMap[chunkId] === false) {
        hotDisposeChunk(chunkId);
      }
    });
  
    let idx;
    let queue = outdatedModules.slice();
    while (queue.length > 0) {
      moduleId = queue.pop();
      module = context.installedModules[moduleId];
      if (!module) continue;
  
      let data = {};
  
      // Call dispose handlers
      let disposeHandlers = module.hot._disposeHandlers;
      for (j = 0; j < disposeHandlers.length; j++) {
        cb = disposeHandlers[j];
        cb(data);
      }
      hotCurrentModuleData[moduleId] = data;
  
      // disable module (this disables requires from this module)
      module.hot.active = false;
  
      // remove module from cache
      delete context.installedModules[moduleId];
  
      // when disposing there is no need to call dispose handler
      delete outdatedDependencies[moduleId];
  
      // remove "parents" references from all children
      for (j = 0; j < module.children.length; j++) {
        let child = context.installedModules[module.children[j]];
        if (!child) continue;
        idx = child.parents.indexOf(moduleId);
        if (idx >= 0) {
          child.parents.splice(idx, 1);
        }
      }
    }
  
    // remove outdated dependency from module children
    let dependency;
    let moduleOutdatedDependencies;
    for (moduleId in outdatedDependencies) {
      if (
        _hasOwnProperty.call(outdatedDependencies, moduleId)) {
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
    }
  
    // Now in "apply" phase
    hotSetStatus('apply');
  
    if (hotUpdateNewHash !== undefined) {
      hotCurrentHash = hotUpdateNewHash;
      hotUpdateNewHash = undefined;
    }
    hotUpdate = undefined;
  
    // insert new code
    for (moduleId in appliedUpdate) {
      if (_hasOwnProperty.call(appliedUpdate, moduleId)) {
        modules[moduleId] = appliedUpdate[moduleId];
      }
    }
  
    // call accept handlers
    let error = null;
    for (moduleId in outdatedDependencies) {
      if (
        _hasOwnProperty.call(outdatedDependencies, moduleId)) {
        module = context.installedModules[moduleId];
        if (module) {
          moduleOutdatedDependencies = outdatedDependencies[moduleId];
          let callbacks = [];
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
                  moduleId,
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
    }
  
    // Load self accepted modules
    for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
      let item = outdatedSelfAcceptedModules[i];
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
                moduleId,
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
              moduleId,
              error: err
            });
          }
          if (!options.ignoreErrored) {
            if (!error) error = err;
          }
        }
      }
    }
  
    // handle errors in accept handlers and self accepted module load
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
  }

  __webpack_require__.f = {};
  // This file contains only the entry chunk.
  // The chunk loading function for additional chunks
  __webpack_require__.e = function requireEnsure(chunkId) {
    let promises = [];

    // mini-css-extract-plugin CSS loading
    if (context.installedCssChunks[chunkId]) promises.push(context.installedCssChunks[chunkId]);
    else if (context.installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {
      promises.push(context.installedCssChunks[chunkId] = new Promise(function (resolve, reject) {
        let href = __webpack_require__.p + cssChunks[chunkId];
        importCss(href, { 
          timeout, 
          head: context.__windowProxy__.doc.head, 
          scopeName, 
          host,
          devtool,
          beforeSource,
          cached
        }).then(resolve).catch(function (err) {
          delete context.installedCssChunks[chunkId];
          reject(err);
        });
      }).then(function () {
        context.installedCssChunks[chunkId] = 0;
      }));
    } else {
      // console.warn('[import-remote:CSS_CHUNK_LOAD_FAILED] chunkId:' + chunkId + ' not found!');
    }

    // js chunk loading
    let installedChunkData = context.installedChunks[chunkId];
    if (installedChunkData !== 0) { // 0 means "already installed".
      // a Promise means "currently loading".
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        // setup Promise in chunk cache
        let promise = new Promise(function (resolve, reject) {
          installedChunkData = context.installedChunks[chunkId] = [resolve, reject];
        });
        promises.push(installedChunkData[2] = promise);

        let prom;
        let jsChunk = jsChunks[chunkId];
        if (Array.isArray(jsChunk)) {
          prom = Promise.all(
            jsChunk.map(
              v => importJs(__webpack_require__.p + v, { timeout, global: context, cached, scopeName, host, devtool, beforeSource })
            )
          ).then(results => results[0]);
        } else prom = importJs(__webpack_require__.p + jsChunk, { timeout, global: context, cached, scopeName, host, devtool, beforeSource });

        prom.then(function (result) {
          let chunk = context.installedChunks[chunkId];
          if (Array.isArray(chunk)) chunk[0](result);
          else if (installedChunkData) installedChunkData[0](result);
        }).catch(event => {
          let chunk = context.installedChunks[chunkId];
          let errorMessage = event && event.message;
          let url = event && event.url;
          let errorType = event && (event.type === 'load' ? 'missing' : event.type);
          let error = new Error(errorMessage || 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + (url ? ': ' + url : '') + ')');
          error.code = 'JS_CHUNK_LOAD_FAILED';
          error.type = errorType;
          error.request = url;
          if (Array.isArray(chunk)) chunk[1](error);
          context.installedChunks[chunkId] = undefined;
        });
      }
    }
    return Promise.all(promises);
  };

  // expose the modules object (__webpack_modules__)
  __webpack_require__.m = modules;

  // expose the module cache
  __webpack_require__.c = context.installedModules;

  // define getter function for harmony exports
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      objectDefineProperty(exports, name, { enumerable: true, get: getter });
    }
  };

  // define __esModule on exports
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      objectDefineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    objectDefineProperty(exports, '__esModule', { value: true });
  };

  // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 8|1: behave like require
  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = __webpack_require__(value);
    if (mode & 8) return value;
    if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    let ns = Object.create(null);
    __webpack_require__.r(ns);
    objectDefineProperty(ns, 'default', { enumerable: true, value });
    if (mode & 2 && typeof value != 'string') {
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (let key in value) __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));
    }
    return ns;
  };

  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = function (module) {
    let getter = module && module.__esModule
      ? function getDefault() { return module.default; }
      : function getModuleExports() { return module; };
    __webpack_require__.d(getter, 'a', getter);
    return getter;
  };

  // _hasOwnProperty.call
  __webpack_require__.o = function (object, property) { return _hasOwnProperty.call(object, property); };

  // __webpack_public_path__
  __webpack_require__.p = joinUrl(host, publicPath);

  // on error function for async loading
  __webpack_require__.oe = function (err) { console.error(err); throw err; };


  function checkDeferredModules() {
    let result;
    for (let i = 0; i < context.deferredModules.length; i++) {
      let deferredModule = context.deferredModules[i];
      let fulfilled = true;
      for (let j = 1; j < deferredModule.length; j++) {
        let depId = deferredModule[j];
        if (context.installedChunks[depId] !== 0) fulfilled = false;
      }
      if (fulfilled) {
        context.deferredModules.splice(i--, 1);
        result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
      }
    }

    return result;
  }

  // install a JSONP callback for chunk loading
  function webpackJsonpCallback(data) {
    let chunkIds = data[0];
    let moreModules = data[1];
    let executeModules = data[2];

    // add "moreModules" to the modules object,
    // then flag all "chunkIds" as loaded and fire callback
    let chunkId;
    let i = 0;
    let resolves = [];
    for (;i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (_hasOwnProperty.call(context.installedChunks, chunkId)
        && context.installedChunks[chunkId]) {
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
    }

    // add entry modules from loaded chunk to deferred list
    // eslint-disable-next-line prefer-spread
    context.deferredModules.push.apply(context.deferredModules, executeModules || []);

    // run deferred modules when all chunks ready
    return checkDeferredModules();
  }

  // run deferred modules from other chunks
  checkDeferredModules();

  return __webpack_require__;
}

export default createRuntime;