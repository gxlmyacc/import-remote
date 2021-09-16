"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRequireFactory = isRequireFactory;
exports["default"] = void 0;

require("core-js/modules/es6.array.reduce");

require("core-js/modules/es6.array.map");

require("core-js/modules/es6.promise");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.array.filter");

require("regenerator-runtime/runtime");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _utils = require("./utils");

function defaultRequireFactory(modulesMap) {
  return /*#__PURE__*/function () {
    var _requireFactory2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/regeneratorRuntime.mark(function _callee(externals) {
      var moduleExternals, modules;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              moduleExternals = externals.filter(function (external) {
                return modulesMap[external.name];
              });
              _context.next = 3;
              return Promise.all(moduleExternals.map(function (external) {
                return modulesMap[external.name]();
              }));

            case 3:
              modules = _context.sent;
              return _context.abrupt("return", moduleExternals.reduce(function (p, external, i) {
                p[external.name] = modules[i];
                return p;
              }, {}));

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function _requireFactory(_x) {
      return _requireFactory2.apply(this, arguments);
    }

    return _requireFactory;
  }();
}

function createRequireFactory(factory) {
  if ((0, _utils.isPlainObject)(factory)) factory = defaultRequireFactory(factory);
  (0, _utils.innumerable)(factory, '__import_remote_require_factory__', true);
  return factory;
}

function isRequireFactory(fn) {
  return fn && fn.__import_remote_require_factory__;
}

var _default = createRequireFactory;
exports["default"] = _default;