"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.string.trim");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _fetch = _interopRequireWildcard(require("./fetch"));

var _utils = require("./utils");

/** @type {import('../types/importJson').default}  */
function importJson(url) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$cached = _ref.cached,
      cached = _ref$cached === void 0 ? _fetch.globalCached : _ref$cached,
      options = (0, _objectWithoutProperties2["default"])(_ref, ["cached"]);

  if (!cached._json) (0, _utils.innumerable)(cached, '_json', {});

  var next = function next(url) {
    if (cached._json[url]) return cached._json[url];
    return cached._json[url] = new Promise(function (resolve, reject) {
      (0, _fetch["default"])(url, options).then(function (source) {
        try {
          resolve(JSON.parse(source.trim()));
        } catch (err) {
          console.error(err, source);
          reject(err);
        }
      })["catch"](function (ex) {
        delete cached._json[url];
        return reject(ex);
      });
    });
  };

  if (url.then) return url.then(next);
  return next(url);
}

var _default = importJson;
exports["default"] = _default;