"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "fetch", {
  enumerable: true,
  get: function get() {
    return _fetch["default"];
  }
});
Object.defineProperty(exports, "requireJs", {
  enumerable: true,
  get: function get() {
    return _fetch.requireJs;
  }
});
Object.defineProperty(exports, "innumerable", {
  enumerable: true,
  get: function get() {
    return _utils.innumerable;
  }
});
Object.defineProperty(exports, "mergeObject", {
  enumerable: true,
  get: function get() {
    return _utils.mergeObject;
  }
});
Object.defineProperty(exports, "requireWithVersion", {
  enumerable: true,
  get: function get() {
    return _utils.requireWithVersion;
  }
});
Object.defineProperty(exports, "objectDefineProperty", {
  enumerable: true,
  get: function get() {
    return _utils.objectDefineProperty;
  }
});
Object.defineProperty(exports, "requireManifest", {
  enumerable: true,
  get: function get() {
    return _remote.requireManifest;
  }
});
Object.defineProperty(exports, "RemoteModule", {
  enumerable: true,
  get: function get() {
    return _module["default"];
  }
});
Object.defineProperty(exports, "createRequireFactory", {
  enumerable: true,
  get: function get() {
    return _requireFactory["default"];
  }
});
Object.defineProperty(exports, "importJs", {
  enumerable: true,
  get: function get() {
    return _importJs["default"];
  }
});
Object.defineProperty(exports, "importJson", {
  enumerable: true,
  get: function get() {
    return _importJson["default"];
  }
});
Object.defineProperty(exports, "importCss", {
  enumerable: true,
  get: function get() {
    return _importCss["default"];
  }
});
Object.defineProperty(exports, "jsonp", {
  enumerable: true,
  get: function get() {
    return _jsonp["default"];
  }
});
Object.defineProperty(exports, "satisfy", {
  enumerable: true,
  get: function get() {
    return _semver.satisfy;
  }
});
Object.defineProperty(exports, "versionLt", {
  enumerable: true,
  get: function get() {
    return _semver.versionLt;
  }
});
exports["default"] = exports.version = void 0;

var _fetch = _interopRequireWildcard(require("./fetch"));

var _utils = require("./utils");

var _remote = _interopRequireWildcard(require("./remote"));

var _module = _interopRequireDefault(require("./module"));

var _requireFactory = _interopRequireDefault(require("./requireFactory"));

var _importJs = _interopRequireDefault(require("./importJs"));

var _importJson = _interopRequireDefault(require("./importJson"));

var _importCss = _interopRequireDefault(require("./importCss"));

var _jsonp = _interopRequireDefault(require("./jsonp"));

var _semver = require("./semver");

// eslint-disable-next-line no-undef
var version = typeof "0.0.18-alpha.0" === 'undefined' ? undefined : "0.0.18-alpha.0";
exports.version = version;
var remoteExternal = {
  RemoteModule: _module["default"],
  createRequireFactory: _requireFactory["default"],
  fetch: _fetch["default"],
  requireJs: _fetch.requireJs,
  importJs: _importJs["default"],
  importJson: _importJson["default"],
  importCss: _importCss["default"],
  jsonp: _jsonp["default"],
  mergeObject: _utils.mergeObject,
  innumerable: _utils.innumerable,
  satisfy: _semver.satisfy,
  versionLt: _semver.versionLt,
  requireWithVersion: _utils.requireWithVersion,
  requireManifest: _remote.requireManifest,
  version: version,
  "default": _remote["default"]
};
(0, _utils.innumerable)(remoteExternal, '__esModule', true);

_remote["default"].use = function (plugin) {
  plugin && plugin.install(_remote["default"]);
};

_remote["default"].externals['import-remote'] = remoteExternal;
var _default = _remote["default"];
exports["default"] = _default;