"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.string.ends-with");

require("core-js/modules/es6.regexp.match");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es6.array.map");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _base = _interopRequireDefault(require("base-64"));

var _fetch = _interopRequireWildcard(require("./fetch"));

var _utils = require("./utils");

var scopeNameRegx = /\(import-remote\)\/((?:@[^/]+\/[^/]+)|(?:[^@][^/]+))/;

function importJs(href) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$cached = _ref.cached,
      cached = _ref$cached === void 0 ? _fetch.globalCached : _ref$cached,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? _utils.DEFAULT_TIMEOUT : _ref$timeout,
      global = _ref.global,
      sync = _ref.sync,
      scopeName = _ref.scopeName,
      host = _ref.host,
      devtool = _ref.devtool,
      nocache = _ref.nocache,
      beforeSource = _ref.beforeSource,
      method = _ref.method,
      webpackChunk = _ref.webpackChunk,
      publicPath = _ref.publicPath,
      sourcemapHost = _ref.sourcemapHost;

  if (!cached._js) (0, _utils.innumerable)(cached, '_js', {});
  if (!webpackChunk && cached._js[href]) return cached._js[href];
  var prom = new Promise(function (resolve, reject) {
    (0, _fetch["default"])(href, {
      timeout: timeout,
      sync: sync,
      nocache: nocache,
      beforeSource: beforeSource,
      method: method
    }).then(function (source) {
      try {
        if (host && source) {
          if (!/\/$/.test(host)) host += '/';

          if ((0, _utils.isEvalDevtool)(devtool)) {
            var isEval = /^eval/.test(String(devtool));

            if (isEval) {
              source = source.replace(/\/\/# sourceURL=\[module\]\\n/g, '\\n');
              source = source.replace(/\/\/# sourceURL=(webpack-internal:\/\/\/[A-Za-z/\-_0-9.@+[\]]+)\\n/g, function (m, p1) {
                return '\\n';
              } // `//# sourceURL=${host}__get-internal-source?fileName=${encodeURIComponent(p1)}\\n`
              );
            }

            var regx = new RegExp("\\/\\/# sourceMappingURL=data:application\\/json;charset=utf-8;base64,([0-9A-Za-z=/+.-]+)".concat(isEval ? '\\\\n' : '(?:\\n|$)'), 'g');
            source = source.replace(regx, function (m, p1) {
              var sourcemap = JSON.parse(_base["default"].decode(p1));
              sourcemap.sources = sourcemap.sources.map(function (src) {
                if (scopeName) {
                  var _ref2 = src.match(scopeNameRegx) || [],
                      _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
                      srcScopeName = _ref3[1];

                  if (srcScopeName && srcScopeName !== scopeName) {
                    src = src.replace(scopeNameRegx, "(import-remote)/[".concat(scopeName, "]"));
                  }
                }

                if (/\?[a-z0-9]{4}$/.test(src)) src = src.substr(0, src.length - 5);
                return /^https?:/.test(src) ? src : host + src;
              });
              return "//# sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(_base["default"].encode(JSON.stringify(sourcemap))).concat(isEval ? '\\n' : m.endsWith('\n') ? '\n' : '');
            });
          } else {
            source = (0, _utils.transformSourcemapUrl)(href, source, {
              devtool: devtool,
              sourcemapHost: sourcemapHost,
              scopeName: scopeName,
              host: host,
              publicPath: publicPath,
              webpackChunk: webpackChunk
            });
          }
        }

        if (beforeSource) source = beforeSource(source, 'js', href);
        var result = (0, _utils.requireFromStr)(source, {
          global: global
        });
        resolve(result);
      } catch (err) {
        if (err && !err.url) err.url = href;
        console.error(err, source);
        reject(err);
      }
    })["catch"](function (ex) {
      delete cached._js[href];
      return reject(ex);
    });
  });
  if (!webpackChunk) cached._js[href] = prom;
  return prom;
}

var _default = importJs;
exports["default"] = _default;