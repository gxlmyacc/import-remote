"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "requireApp", {
  enumerable: true,
  get: function get() {
    return _app["default"];
  }
});
Object.defineProperty(exports, "createAppView", {
  enumerable: true,
  get: function get() {
    return _app.createAppView;
  }
});
exports["default"] = void 0;

var _app = _interopRequireWildcard(require("./app"));

var _view = _interopRequireDefault(require("./view"));

var _utils = require("./utils");

var external = {
  createAppView: _app.createAppView,
  requireApp: _app["default"],
  "default": _view["default"]
};
(0, _utils.innumerable)(external, '__esModule', true);

_view["default"].install = function (remote) {
  var remoteExternal = remote.externals && remote.externals['import-remote'];
  if (!remoteExternal) return;
  var RemoteModule = remoteExternal.RemoteModule;
  var mergeObject = remoteExternal.mergeObject;

  if (RemoteModule) {
    RemoteModule.prototype.requireApp = function () {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (0, _app["default"])(this.resolveModuleUrl(moduleName), mergeObject({}, this.options, options, {
        host: this.host
      }));
    };
  }

  remote.externals['import-remote/view'] = external;
};

var _default = _view["default"];
exports["default"] = _default;