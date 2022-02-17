"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.array.map");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.function.name");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _remote = _interopRequireWildcard(require("./remote"));

var _fetch = require("./fetch");

var _utils = require("./utils");

/** @type {import('../types/module').RemoteModule} */
var RemoteModule = /*#__PURE__*/function () {
  function RemoteModule(host) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck2["default"])(this, RemoteModule);
    if (!options.resolveModuleUrl && !host) throw new Error('[RemoteModule]`host` can not empty！');
    this.host = (0, _utils.resolveRelativeUrl)(host);
    this.pathname = options.pathname || '';
    this.resolveModuleUrl = options.resolveModuleUrl || _fetch.resolveModuleUrl;
    delete options.resolveModuleUrl;
    this.options = options || {};
  }

  (0, _createClass2["default"])(RemoteModule, [{
    key: "external",
    value: function external(name, module) {
      if (!this.options.externals) this.options.externals = {};
      if (typeof name === 'string') this.options.externals[name] = module;else Object.assign(this.options.externals, name);
    }
  }, {
    key: "isRequired",
    value: function isRequired() {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var url = this.resolveModuleUrl(this.host + this.pathname, moduleName, _fetch.resolveModuleUrl);
      return url.then ? url.then(function (url) {
        return Boolean(_remote["default"].cached[url]);
      }) : Promise.resolve(Boolean(_remote["default"].cached[url]));
    }
  }, {
    key: "prefetch",
    value: function prefetch() {
      var _this = this;

      var prefetchs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      return Promise.all(prefetchs.slice().map(function (moduleName) {
        return _this.require(moduleName);
      }));
    }
  }, {
    key: "exist",
    value: function exist() {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (0, _fetch.existModule)(this.host + this.pathname, moduleName, options);
    }
  }, {
    key: "requireMeta",
    value: function requireMeta() {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var url = this.resolveModuleUrl(this.host + this.pathname, moduleName, _fetch.resolveModuleUrl, options.sync);

      var next = function next(url) {
        return (0, _remote.requireManifest)(url, (0, _utils.mergeObject)({
          meta: true
        }, options)).then(function (r) {
          return r && r.meta || {};
        });
      };

      if (url.then) return url.then(next);
      return next(url);
    }
  }, {
    key: "requireMetaSync",
    value: function requireMetaSync() {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var result;
      this.requireMeta(moduleName, (0, _utils.mergeObject)({}, options, {
        sync: true
      })).then(function (r) {
        return result = r;
      })["catch"](function (ex) {
        throw ex;
      });
      return result;
    }
  }, {
    key: "require",
    value: function require() {
      var _this2 = this;

      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var url = this.resolveModuleUrl(this.host + this.pathname, moduleName, _fetch.resolveModuleUrl, options.sync);

      var next = function next(url) {
        return (0, _remote["default"])(url, (0, _utils.mergeObject)({}, _this2.options, options, {
          host: _this2.host
        }));
      };

      if (url.then) return url.then(next);
      return next(url);
    }
  }, {
    key: "requireSync",
    value: function requireSync() {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var result;

      this.require(moduleName, (0, _utils.mergeObject)({}, options, {
        sync: true
      })).then(function (r) {
        return result = r;
      })["catch"](function (ex) {
        throw ex;
      });

      return result;
    }
  }, {
    key: "import",
    value: function _import() {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.require(moduleName, options).then(function (result) {
        result && result.__esModule && (result = result["default"]);
        return result;
      });
    }
  }, {
    key: "importSync",
    value: function importSync() {
      var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'index.js';
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var result = this.requireSync(moduleName, options);
      result && result.__esModule && (result = result["default"]);
      return result;
    }
  }]);
  return RemoteModule;
}();

(0, _utils.innumerable)(RemoteModule, '__import_remote_module_class__', true);
var _default = RemoteModule;
exports["default"] = _default;