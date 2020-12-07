"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.weak-map");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "requireApp", {
  enumerable: true,
  get: function get() {
    return _app.default;
  }
});
Object.defineProperty(exports, "createAppView", {
  enumerable: true,
  get: function get() {
    return _app.createAppView;
  }
});
exports.default = void 0;

var _app = _interopRequireWildcard(require("./app"));

var _view = _interopRequireDefault(require("./view"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var external = {
  createAppView: _app.createAppView,
  requireApp: _app.default,
  default: _view.default
};

_view.default.install = function (remote) {
  var remoteExternal = remote.externals && remote.externals['import-remote'];
  if (!remoteExternal) return;
  var RemoteModule = remoteExternal.RemoteModule;
  var mergeObject = remoteExternal.mergeObject;

  if (RemoteModule) {
    RemoteModule.prototype.requireApp = function () {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (0, _app.default)(this.resolveModuleUrl(moduleName), mergeObject({}, this.options, options, {
        host: this.host
      }));
    };
  }

  remote.externals['import-remote/view'] = external;
};

var _default = _view.default;
exports.default = _default;