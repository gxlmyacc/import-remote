"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAppView = createAppView;
exports.default = void 0;

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.reflect.construct");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.object.assign");

var _react = _interopRequireDefault(require("react"));

var _utils = require("./utils");

var _ = _interopRequireDefault(require("../.."));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function createAppView(view) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (view && view.__esModule) view = view.default;
  if (!view) return null;

  if (typeof view !== 'function' || (0, _utils.isReactComponent)(view) || (0, _utils.isForwardComponent)(view)) {
    return view;
  }

  var RemoteAppView = /*#__PURE__*/function (_React$Component) {
    _inherits(RemoteAppView, _React$Component);

    var _super = _createSuper(RemoteAppView);

    function RemoteAppView(props) {
      var _this;

      _classCallCheck(this, RemoteAppView);

      _this = _super.call(this, props);
      if (view.bootstrap) view.bootstrap(props, options);
      return _this;
    }

    _createClass(RemoteAppView, [{
      key: "_getAppProps",
      value: function _getAppProps(props) {
        var id = props.id,
            className = props.className,
            style = props.style,
            otherProps = _objectWithoutProperties(props, ["id", "className", "style"]);

        if (props.children) (0, _utils.innumerable)(otherProps, 'children', props.children);
        return {
          id: id,
          className: className,
          style: style,
          otherProps: otherProps
        };
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        var props = this._getAppProps(this.props).otherProps;

        if (view.mounted) {
          return view.mounted(this.root, props);
        }

        if (view.init || view.forceInit) {
          var prom = (view.init || view.forceInit)(props, options);

          if (prom && prom.then) {
            prom.then(function () {
              return view.render && view.render(_this2.root, props);
            });
          } else view.render && view.render(this.root, props);
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        if (view.unmount) view.unmount(this.root);else if (view.destroy) view.destroy(this.root);else if (view.destory) view.destory(this.root);
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        var newProps = this._getAppProps(this.props).otherProps;

        var oldProps = this._getAppProps(prevProps).otherProps;

        if (view.update) view.update(this.root, newProps, oldProps);else if (view.mounted) view.mounted(this.root, newProps);else if (view.init || view.forceInit) (view.init || view.forceInit)(newProps);
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var props = {
          className: 'import-remote-app'
        };

        if (view.inheritAttrs !== false) {
          var _this$_getAppProps = this._getAppProps(this.props),
              id = _this$_getAppProps.id,
              className = _this$_getAppProps.className,
              style = _this$_getAppProps.style;

          Object.assign(props, {
            id: id,
            style: style
          });
          if (className) props.className += " ".concat(className);
        }

        return _react.default.createElement('div', _objectSpread(_objectSpread({}, props), {}, {
          ref: function ref(el) {
            return _this3.el = el;
          }
        }));
      }
    }, {
      key: "root",
      get: function get() {
        var shadow = options.shadow;

        if (shadow && !this.shadowEl && _utils.supportShadow) {
          this.shadowEl = (0, _utils.createShadowRoot)(this.el);
        }

        return shadow ? this.shadowEl || this.el : this.el;
      }
    }]);

    return RemoteAppView;
  }(_react.default.Component);

  RemoteAppView.__import_remote_app__ = true;
  return RemoteAppView;
}

function requireApp(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return (0, _.default)(url, options).then(function (view) {
    return createAppView(view, options);
  });
}

var _default = requireApp;
exports.default = _default;