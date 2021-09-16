"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.object.define-properties");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.array.filter");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.reflect.construct");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAppView = createAppView;
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es6.object.assign");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _react = _interopRequireDefault(require("react"));

var _utils = require("./utils");

var _ = _interopRequireDefault(require("../.."));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function createAppView(view) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (view && view.__esModule) view = view["default"];
  if (!view) return null;

  if (typeof view === 'function' || (0, _utils.isReactComponent)(view) || (0, _utils.isForwardComponent)(view)) {
    return view;
  }

  var RemoteAppView = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(RemoteAppView, _React$Component);

    var _super = _createSuper(RemoteAppView);

    function RemoteAppView(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, RemoteAppView);
      _this = _super.call(this, props);
      if (view.bootstrap) view.bootstrap(props, options);
      return _this;
    }

    (0, _createClass2["default"])(RemoteAppView, [{
      key: "_getAppProps",
      value: function _getAppProps(props) {
        var id = props.id,
            className = props.className,
            style = props.style,
            otherProps = (0, _objectWithoutProperties2["default"])(props, ["id", "className", "style"]);
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

        return _react["default"].createElement('div', _objectSpread(_objectSpread({}, props), {}, {
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
  }(_react["default"].Component);

  RemoteAppView.__import_remote_app__ = true;
  return RemoteAppView;
}

function requireApp(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return (0, _["default"])(url, options).then(function (view) {
    return createAppView(view, options);
  });
}

var _default = requireApp;
exports["default"] = _default;