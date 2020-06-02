const { DEFAULT_TIMEOUT } = require('./utils');
const importCss = require('./importCss');
const importJs = require('./importJs');

module.exports = function (modules = [], {
  jsonpFunction = 'webpackJsonp',
  publicPath = '',
  cssChunks = {},
  jsChunks = {},
  context = {},
  timeout = DEFAULT_TIMEOUT,
} = {}) {
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
  let parentJsonpFunction = oldJsonpFunction;

  // The require function
  // eslint-disable-next-line camelcase
  function __webpack_require__(moduleId) {
  // Check if module is in cache
    if (context.installedModules[moduleId]) {
      return context.installedModules[moduleId].exports;
    }
    // Create a new module (and put it into the cache)
    let module = context.installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    // Execute the module function
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    // Flag the module as loaded
    module.l = true;

    // Return the exports of the module
    return module.exports;
  }

  // This file contains only the entry chunk.
  // The chunk loading function for additional chunks
  __webpack_require__.e = function requireEnsure(chunkId) {
    let promises = [];

    // mini-css-extract-plugin CSS loading
    if (context.installedCssChunks[chunkId]) promises.push(context.installedCssChunks[chunkId]);
    else if (context.installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {
      promises.push(context.installedCssChunks[chunkId] = new Promise(function (resolve, reject) {
        let href = __webpack_require__.p + cssChunks[chunkId];
        importCss(href, timeout).then(resolve).catch(function (err) {
          delete context.installedCssChunks[chunkId];
          reject(err);
        });
      }).then(function () {
        context.installedCssChunks[chunkId] = 0;
      }));
    } else {
      console.warn('[CSS_CHUNK_LOAD_FAILED] chunkId:' + chunkId + 'not found!');
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

        let href = __webpack_require__.p + jsChunks[chunkId];
        importJs(href, timeout, context.global).then(function (result) {
          let chunk = context.installedChunks[chunkId];
          chunk[0](result);
        }).catch(event => {
          let chunk = context.installedChunks[chunkId];
          let errorMessage = event && event.message;
          let errorType = event && (event.type === 'load' ? 'missing' : event.type);
          let error = new Error(errorMessage || 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + href + ')');
          error.code = 'JS_CHUNK_LOAD_FAILED';
          error.type = errorType;
          error.request = href;
          chunk[1](error);
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
      Object.defineProperty(exports, name, { enumerable: true, get: getter });
    }
  };

  // define __esModule on exports
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
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
    Object.defineProperty(ns, 'default', { enumerable: true, value });
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

  // Object.prototype.hasOwnProperty.call
  __webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

  // __webpack_public_path__
  __webpack_require__.p = publicPath;

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
      if (Object.prototype.hasOwnProperty.call(context.installedChunks, chunkId)
        && context.installedChunks[chunkId]) {
        resolves.push(context.installedChunks[chunkId][0]);
      }
      context.installedChunks[chunkId] = 0;
    }
    Object.keys(moreModules).forEach(function (moduleId) {
      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        modules[moduleId] = moreModules[moduleId];
      }
    });

    if (parentJsonpFunction) parentJsonpFunction(data);

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

  // eslint-disable-next-line camelcase
  return __webpack_require__;
};
