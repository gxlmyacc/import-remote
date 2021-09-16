"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.object.define-properties");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.array.filter");

require("core-js/modules/es6.symbol");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requireJs = requireJs;
exports.checkRemoteModuleWebpack = checkRemoteModuleWebpack;
exports.resolveModuleUrl = resolveModuleUrl;
exports.isAbsoluteUrl = isAbsoluteUrl;
exports.joinUrl = joinUrl;
exports.existModule = existModule;
Object.defineProperty(exports, "objectDefineProperty", {
  enumerable: true,
  get: function get() {
    return _objdp.objectDefineProperty;
  }
});
exports["default"] = exports.AsyncRemoteModule = exports.globalCached = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.date.now");

require("core-js/modules/es6.array.index-of");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.array.reduce");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objdp = require("./_objdp");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var DEFAULT_HEAD_TIMEOUT = 30000;

function checkRemoteModuleWebpack() {
  var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;

  if (!context.__remoteModuleWebpack__) {
    context.__remoteModuleWebpack__ = {
      __moduleManifests__: {},
      cached: {}
    };
  }

  return context.__remoteModuleWebpack__;
}

checkRemoteModuleWebpack();
var globalCached = window.__remoteModuleWebpack__.cached;
exports.globalCached = globalCached;
var queue = [];

function pushQueue(url, resolve, reject) {
  var item = {
    url: url
  };
  queue.push(item);

  var walk = function walk() {
    while (queue.length && queue[0].done) {
      queue.shift().done();
    }
  };

  return {
    success: function success(r) {
      item.done = function () {
        return resolve(r);
      };

      walk();
    },
    fail: function fail(r) {
      item.done = function () {
        return reject(r);
      };

      walk();
    }
  };
}

function innumerable(obj, key, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    configurable: true
  };
  (0, _objdp.objectDefineProperty)(obj, key, _objectSpread({
    value: value
  }, options));
  return obj;
}

function fetch(url) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 120000 : _ref$timeout,
      sync = _ref.sync,
      nocache = _ref.nocache,
      _ref$method = _ref.method,
      method = _ref$method === void 0 ? 'GET' : _ref$method,
      headers = _ref.headers;

  if (!globalCached._fetched) innumerable(globalCached, '_fetched', {});
  var fetched = globalCached._fetched;
  if (fetched[url]) return fetched[url];
  var isHeadRequest = ['HEAD', 'OPTIONS'].includes(method);
  var prom = new Promise(function (resolve, reject) {
    var res = pushQueue(url, resolve, function (r) {
      delete fetched[url];
      return reject(r);
    });
    var xhr = new XMLHttpRequest();
    var timerId;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        timerId && clearTimeout(timerId) || (timerId = 0);

        if (xhr.status === 0) {
          // timeout
          var err = new Error('fetch [' + url + '] timed out.');
          err.xhr = xhr;
          err.url = url;
          res.fail(err);
        } else if (xhr.status === 404) {
          // no update available
          var _err = new Error('fetch [' + url + '] not found.');

          _err.xhr = xhr;
          _err.url = url;
          res.fail(_err);
        } else if (xhr.status !== 200 && xhr.status !== 304) {
          // other failure
          var _err2 = new Error('fetch [' + url + '] failed.');

          _err2.xhr = xhr;
          _err2.url = url;
          res.fail(_err2);
        } else {
          // success
          if (isHeadRequest) {
            var rheaders = xhr.getAllResponseHeaders().split('\n').reduce(function (p, v) {
              var _v$split = v.split(': '),
                  _v$split2 = (0, _slicedToArray2["default"])(_v$split, 2),
                  key = _v$split2[0],
                  value = _v$split2[1];

              if (!key) return p;
              p[key] = value;
              return p;
            }, {});
            res.success(rheaders);
          } else res.success(xhr.responseText);
        }
      }
    };

    try {
      if (nocache) url += "".concat(~url.indexOf('?') ? '&' : '?', "_=").concat(Date.now());
      xhr.timeout = timeout;
      xhr.open(method, url, !sync);
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      if (headers) Object.keys(headers).forEach(function (key) {
        return xhr.setRequestHeader(key, headers[key]);
      }); // if (nocache) {
      //   xhr.setRequestHeader('If-Modified-Since', '0');
      //   xhr.setRequestHeader('Cache-Control', 'no-cache');
      // }

      xhr.send(null);
      timerId = setTimeout(function () {
        xhr.abort();
        xhr.onreadystatechange = null;
        timerId = 0;
        res.fail({
          type: 'timeout',
          target: xhr
        });
      }, timeout);
    } catch (e) {
      res.fail(e);
    }
  });
  if (!isHeadRequest) fetched[url] = prom;
  return prom;
}

fetch.queue = queue;

function requireJs(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var cached = options.cached || globalCached;
  if (!cached._rs) innumerable(cached, '_rs', {});
  if (cached._rs[url]) return cached._rs[url];
  return cached._rs[url] = fetch(url, options).then(function (src) {
    // eslint-disable-next-line no-new-func
    var fn = new Function('module', 'exports', 'require', src);
    var _module = {
      exports: {}
    };

    try {
      fn(_module, _module.exports, options.require || function (name) {
        throw new Error("[import-remote:requireJs]module [".concat(name, "] cannot be found!"));
      });
    } catch (ex) {
      throw ex;
    }

    return _module.exports;
  })["catch"](function (ex) {
    delete cached._rs[url];
    return ex;
  });
}

function isAbsoluteUrl(url) {
  return typeof url === 'string' && /^(((https?:)?\/\/)|(data:))/.test(url);
}

function joinUrl(host, path) {
  if (path && /^["'].+["']$/.test(path)) path = path.substr(1, path.length - 2);
  if (!host || isAbsoluteUrl(path)
  /* || /^\//.test(path) */
  ) return path;
  if (/^\/[A-Za-z]/.test(host) && path.startsWith(host)) return path;
  if (/\/$/.test(host)) host = host.substr(0, host.length - 1);
  if (/^\.\//.test(path)) path = path.substr(1, path.length);
  return "".concat(host).concat(/^\//.test(path) ? path : "/".concat(path));
}

function resolveModuleUrl(host) {
  var moduleName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'index.js';
  if (!/\.js$/.test(moduleName)) moduleName += '.js';
  return joinUrl(host, moduleName);
}

function existModule(host) {
  var moduleName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'index.js';
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return new Promise(function (resolve) {
    return fetch(resolveModuleUrl(host, moduleName), Object.assign({
      timeout: DEFAULT_HEAD_TIMEOUT,
      nocache: true,
      method: 'HEAD'
    }, options)).then(function (r) {
      return resolve(r);
    })["catch"](function () {
      return resolve(null);
    });
  });
}

var AsyncRemoteModule = /*#__PURE__*/function () {
  function AsyncRemoteModule(libraryUrl, host) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck2["default"])(this, AsyncRemoteModule);
    if (!libraryUrl) throw new Error('[AsyncRemoteModule]libraryUrl can not be null!');
    this.libraryUrl = libraryUrl;
    this.host = host;
    this.options = options || {};
  }

  (0, _createClass2["default"])(AsyncRemoteModule, [{
    key: "readyRuntime",
    value: function readyRuntime() {
      var _this = this;

      return requireJs(this.libraryUrl).then(function (_ref2) {
        var RemoteModule = _ref2.RemoteModule;
        if (_this.runtime) return _this.runtime;
        return _this.runtime = new RemoteModule(_this.host, _this.options);
      });
    }
  }, {
    key: "exist",
    value: function exist() {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return existModule(this.host, moduleName, options);
    }
  }]);
  return AsyncRemoteModule;
}();

exports.AsyncRemoteModule = AsyncRemoteModule;
['requireMeta', 'require', 'import'].forEach(function (key) {
  return AsyncRemoteModule.prototype[key] = function () {
    var _arguments = arguments;
    return this.readyRuntime().then(function (runtime) {
      return runtime[key].apply(runtime, _arguments);
    });
  };
});
var _default = fetch;
exports["default"] = _default;