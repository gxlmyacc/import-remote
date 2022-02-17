"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformStyleHost = transformStyleHost;
exports["default"] = _default;
exports.ATTR_CSS_TRANSFORMED = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.regexp.replace");

var _fetch = _interopRequireWildcard(require("./fetch"));

var _utils = require("./utils");

var ATTR_CSS_TRANSFORMED = 'data-import-remote-transformed';
exports.ATTR_CSS_TRANSFORMED = ATTR_CSS_TRANSFORMED;

function hasFetched(href, head) {
  if (!head) head = document.documentElement.getElementsByTagName('head')[0];
  var existingLinkTags = head.getElementsByTagName('link');

  for (var i = 0; i < existingLinkTags.length; i++) {
    var tag = existingLinkTags[i];
    var dataHref = tag.getAttribute('data-href') || tag.getAttribute('href');
    if (tag.rel === 'stylesheet' && dataHref === href) return true;
  }

  var existingStyleTags = head.getElementsByTagName('style');

  for (var _i = 0; _i < existingStyleTags.length; _i++) {
    var _tag = existingStyleTags[_i];

    var _dataHref = _tag.getAttribute('data-href');

    if (_dataHref === href) return true;
  }

  return false;
}

function transformStyleHost(source, host) {
  if (!host || !source) return source;
  if (/\/$/.test(host)) host = host.substr(0, host.length - 1);
  return source.replace(/url\(([^)]+)\)/ig, function (m, p1) {
    return "url(".concat((0, _utils.joinUrl)(host, p1), ")");
  }); // .replace(/@import\s+(["'])([^"']+)["']/ig, (m, p0, p1) => `@import ${p0 + joinUrl(host, p1) + p0}`);
}
/** @type {import('../types/importCss').default}  */


function fetchStyle(url) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$cached = _ref.cached,
      cached = _ref$cached === void 0 ? _fetch.globalCached : _ref$cached,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? _utils.DEFAULT_TIMEOUT : _ref$timeout,
      sync = _ref.sync,
      head = _ref.head,
      scopeName = _ref.scopeName,
      host = _ref.host,
      beforeSource = _ref.beforeSource,
      method = _ref.method,
      devtool = _ref.devtool,
      sourcemapHost = _ref.sourcemapHost,
      publicPath = _ref.publicPath,
      webpackChunk = _ref.webpackChunk;

  if (!cached._css) (0, _utils.innumerable)(cached, '_css', {});

  var next = function next(url) {
    if (cached._css[url]) return cached._css[url];
    return cached._css[url] = new Promise(function (resolve, reject) {
      // const resolve = r => {
      //   delete cached._css[href];
      //   return _resolve(r);
      // };
      // const reject = r => {
      //   delete cached._css[href];
      //   return _reject(r);
      // };
      if (!head) head = document.getElementsByTagName('head')[0];
      if (hasFetched(url, head)) return resolve();
      (0, _fetch["default"])(url, {
        timeout: timeout,
        sync: sync,
        method: method
      }).then(function (source) {
        try {
          source = transformStyleHost(source, host);
          source = (0, _utils.transformSourcemapUrl)(url, source, {
            devtool: devtool,
            sourcemapHost: sourcemapHost,
            scopeName: scopeName,
            host: host,
            publicPath: publicPath,
            webpackChunk: webpackChunk
          });
          if (beforeSource) source = beforeSource(source, 'css', url, {});
          var styleTag = document.createElement('style');
          styleTag.type = 'text/css';
          styleTag.setAttribute('data-href', url);
          styleTag.setAttribute(ATTR_CSS_TRANSFORMED, '');
          if (scopeName) styleTag.setAttribute(_utils.ATTR_SCOPE_NAME, scopeName);
          styleTag.innerHTML = source;
          head.appendChild(styleTag);
          resolve(styleTag);
        } catch (err) {
          console.error(err);
          err.code = 'CSS_CHUNK_LOAD_FAILED';
          reject(err);
        }
      })["catch"](function (ex) {
        delete cached._css[url];
        return reject(ex);
      });
    });
  };

  if (url.then) return url.then(next);
  return next(url);
}

/** @type {import('../types/importCss').default}  */
function _default(href) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return fetchStyle(href, options);
}