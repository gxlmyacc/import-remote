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
exports.walkMainifest = walkMainifest;
exports.isSameHost = isSameHost;
exports.requireFromStr = requireFromStr;
exports.resolveRelativeUrl = resolveRelativeUrl;
exports.isRegExp = isRegExp;
exports.isPlainObject = isPlainObject;
exports.isFunction = isFunction;
exports.mergeObject = mergeObject;
exports.innumerable = innumerable;
exports.getHostFromUrl = getHostFromUrl;
exports.isEvalDevtool = isEvalDevtool;
exports.requireWithVersion = requireWithVersion;
exports.transformSourcemapUrl = transformSourcemapUrl;
Object.defineProperty(exports, "objectDefineProperty", {
  enumerable: true,
  get: function get() {
    return _objdp.objectDefineProperty;
  }
});
Object.defineProperty(exports, "isAbsoluteUrl", {
  enumerable: true,
  get: function get() {
    return _fetch.isAbsoluteUrl;
  }
});
Object.defineProperty(exports, "joinUrl", {
  enumerable: true,
  get: function get() {
    return _fetch.joinUrl;
  }
});
exports.ATTR_SCOPE_NAME = exports.DEFAULT_TIMEOUT = void 0;

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.array.is-array");

require("core-js/modules/es6.array.index-of");

require("core-js/modules/es6.regexp.constructor");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es6.regexp.split");

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.array.for-each");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objdp = require("./_objdp");

var _fetch = require("./fetch");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var DEFAULT_TIMEOUT = 120000;
exports.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;
var ATTR_SCOPE_NAME = 'data-remote-scope';
exports.ATTR_SCOPE_NAME = ATTR_SCOPE_NAME;

function requireFromStr(source) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$global = _ref.global,
      context = _ref$global === void 0 ? window : _ref$global,
      _ref$moduleProps = _ref.moduleProps,
      moduleProps = _ref$moduleProps === void 0 ? {} : _ref$moduleProps;

  // eslint-disable-next-line no-useless-catch
  try {
    var _module = _objectSpread({
      inRemoteModule: true,
      exports: {}
    }, moduleProps);

    var names = ['module', 'exports'];
    var args = [_module, _module.exports];

    if (context && context !== window) {
      Object.keys(context).forEach(function (key) {
        var v = context[key];

        if (v == null) {
          if (key !== '__windowProxy__') return;
          v = window;
          if (!v.doc) v.doc = window.document;
        }

        names.push(key);
        args.push(v);
      });
    } // eslint-disable-next-line


    var fn = (0, _construct2["default"])(Function, names.concat([source]));
    fn.apply(context, args);
    return _module.exports;
  } catch (ex) {
    // console.error(ex);
    throw ex;
  }
}

function resolveRelativeUrl(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (!url || (0, _fetch.isAbsoluteUrl)(url)) return url;
  var host = options.host || window.location.origin;

  if (/^\.\//.test(url)) {
    url = url.substr(2, url.length);

    if (!options.host) {
      host = "".concat(host).concat(window.location.pathname);

      if (/\.(html?|js)$/.test(host)) {
        var paths = host.split('/');
        paths.pop();
        host = paths.join('/');
      }

      options.onHost && options.onHost(host);
    }
  }

  return (0, _fetch.joinUrl)(host, url);
}

var _toString = Object.prototype.toString;

function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function isRegExp(obj) {
  return _toString.call(obj) === '[object RegExp]';
}

function isFunction(fn) {
  return fn && typeof fn === 'function' && (!fn.prototype || fn.prototype === Function || fn.constructor === Function);
}

function mergeObject(target) {
  function _mergeObject(target, source, copiedObjects) {
    if (!target) return target;
    if (!isPlainObject(source)) return target;
    copiedObjects.push({
      source: source,
      target: target
    });
    Object.keys(source).forEach(function (key) {
      var v = source[key];

      if (isPlainObject(v)) {
        var copied = copiedObjects.find(function (c) {
          return c.target === v;
        });
        if (copied) target[key] = copied.target;else {
          var w = target[key];
          if (!isPlainObject(w)) w = target[key] = {};
          Object.keys(v).forEach(function (key2) {
            return w[key2] = v[key2];
          });
        }
      } else target[key] = v;
    });
    return target;
  }

  var ret = target;
  var copiedObjects = [];

  for (var i = 1; i < arguments.length; i++) {
    _mergeObject(ret, arguments[i], copiedObjects);
  }

  return ret;
}

function walkMainifest(target) {
  var copied = [];

  var _getItem = function _getItem(ret) {
    if (ret && ret._t && ret._v) {
      if (ret._t === 'f') {
        var _ret$_v = (0, _slicedToArray2["default"])(ret._v, 3),
            args = _ret$_v[0],
            body = _ret$_v[1],
            bracket = _ret$_v[2]; // eslint-disable-next-line no-new-func


        ret = (0, _construct2["default"])(Function, (0, _toConsumableArray2["default"])(args).concat(["\"use strict\";".concat(bracket ? '' : 'return (', "\n").concat(body).concat(bracket ? '' : '\n)')]));
      } else if (ret._t === 'r') {
        ret = new RegExp(ret._v, ret._f);
      } else if (ret._t === 'd') {
        ret = new Date(ret._v);
      }
    }

    return ret;
  };

  function _walk(target, copied) {
    if (!target || ~copied.indexOf(target)) return target;
    var isObject;

    if (isPlainObject(target)) {
      if (target._t && target._v) return _getItem(target);
      isObject = true;
    }

    if (isObject || Array.isArray(target)) {
      copied.push(target);
      Object.keys(target).forEach(function (key) {
        target[key] = _walk(target[key], copied);
      });
    }

    return target;
  }

  return _walk(target, copied);
}

function innumerable(obj, key, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    configurable: true,
    writable: true
  };
  (0, _objdp.objectDefineProperty)(obj, key, _objectSpread({
    value: value
  }, options));
  return obj;
}

function getHostFromUrl(url) {
  url = url.replace(/((https?:)?\/\/[^?#]*).*/g, '$1');
  if (!/\.js$/.test(url)) return url;
  var urls = url.replace(/((https?:)?\/\/[^?#]*).*/g, '$1').split('/');
  urls.pop();
  return urls.join('/');
}

function isEvalDevtool(devtool) {
  return typeof devtool === 'string' && /^(eval|inline)/.test(String(devtool));
}

function requireWithVersion(module, version) {
  if (module && !module.version) innumerable(module, 'version', version);
  return module;
}

function isSameHost(host1, host2) {
  host1 = host1.replace(/\/+$/, '');
  host2 = host2.replace(/\/+$/, '');
  return host1.toLowerCase() === host2.toLowerCase();
}

var sourceMappingURLCssRegx = /\/\*# sourceMappingURL=([0-9A-Za-z_.-]+\.(?:js|css)\.map)\*\/$/;
var sourceMappingURLJsRegx = /\/\/# sourceMappingURL=([0-9A-Za-z_.-]+\.(?:js|css)\.map)$/;

function transformSourcemapUrl(href, source) {
  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      devtool = _ref2.devtool,
      sourcemapHost = _ref2.sourcemapHost,
      scopeName = _ref2.scopeName,
      host = _ref2.host,
      publicPath = _ref2.publicPath,
      webpackChunk = _ref2.webpackChunk;

  if (devtool) {
    if (isFunction(sourcemapHost)) sourcemapHost = sourcemapHost({
      scopeName: scopeName,
      host: host,
      publicPath: publicPath,
      href: href,
      source: source,
      webpackChunk: webpackChunk
    });
    if (!sourcemapHost) sourcemapHost = href.split('/').slice(0, -1).join('/');else {
      if (/\/$/.test(sourcemapHost)) sourcemapHost = sourcemapHost.substr(0, sourcemapHost.length - 1);
      sourcemapHost = (0, _fetch.joinUrl)(sourcemapHost, href.substr(publicPath.length, href.length).split('/').slice(0, -1).join('/'));
    }

    if (/\.css$/i.test(href)) {
      source = source.replace(sourceMappingURLCssRegx, function (m, p1) {
        return "/*# sourceMappingURL=".concat((0, _fetch.joinUrl)(sourcemapHost, p1), "*/");
      });
    } else {
      source = source.replace(sourceMappingURLJsRegx, function (m, p1) {
        return "//# sourceMappingURL=".concat((0, _fetch.joinUrl)(sourcemapHost, p1));
      });
    }
  } else if (scopeName) {
    var _sourcemapHost = sessionStorage.getItem("import-remote-".concat(scopeName, "-sourcemapping-host"));

    if (_sourcemapHost && href.startsWith(host)) {
      source = "".concat(source, "\n//# sourceMappingURL=").concat((0, _fetch.joinUrl)(_sourcemapHost, href.substr(host.length, href.length)), ".map");
    }
  }

  return source;
}