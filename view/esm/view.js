"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.reflect.construct");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _hashSum = _interopRequireDefault(require("hash-sum"));

var _ = _interopRequireDefault(require("../.."));

var _app = require("./app");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RemoteView = /*#__PURE__*/function (_React$Component) {
  _inherits(RemoteView, _React$Component);

  var _super = _createSuper(RemoteView);

  function RemoteView(props) {
    var _this;

    _classCallCheck(this, RemoteView);

    _this = _super.call(this, props);
    _this.$refs = {};
    _this.state = {
      loading: false,
      viewSrc: '',
      view: null
    };
    _this.viewContext = {
      cached: {}
    };
    _this.viewScopeName = null;
    _this.listeners = [];
    return _this;
  }

  _createClass(RemoteView, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this._loadView();
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      this._destoryView();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState, snapshot) {
      if (this.props.src !== prevProps.src) {
        this._loadView();
      }
    }
  }, {
    key: "reload",
    value: function reload() {
      this._destoryView(this.viewScopeName);

      this._loadView();
    }
  }, {
    key: "_destoryView",
    value: function _destoryView(viewScopeName) {
      if (!viewScopeName) viewScopeName = this.viewScopeName;
      if (!viewScopeName) return;
      var scopeName = viewScopeName;
      var listeners = this.viewContext[scopeName] && this.viewContext[scopeName].listeners;

      if (listeners) {
        listeners.forEach(function (v) {
          return window.removeEventListener(v.type, v.listener);
        });
        listeners.splice(0, listeners.length);
      }

      var els = document.querySelectorAll(scopeName);
      els.forEach(function (el) {
        return el.parent && el.parent.removeChild(el);
      });
      delete this.viewContext[scopeName];
      var bodyEl = this.$refs.body;
      var bodyClassName = bodyEl && bodyEl.className;

      if (this.viewScopeHash && bodyClassName.includes(this.viewScopeHash)) {
        bodyClassName = bodyClassName.replace(this.viewScopeHash, '');
      }

      if (this.viewNamespace && bodyClassName.includes(this.viewNamespace)) {
        bodyClassName = bodyClassName.replace(this.viewNamespace, '');
      }

      if (bodyClassName !== bodyEl.className) bodyEl.className = bodyClassName.split(' ').filter(Boolean).join(' ');
      this.viewScopeName = '';
      this.viewScopeHash = '';
      this.viewNamespace = '';
      this.viewManifest = null;
    }
  }, {
    key: "_loadView",
    value: function _loadView() {
      var _this2 = this;

      var _this$props = this.props,
          src = _this$props.src,
          externals = _this$props.externals,
          scopePrefix = _this$props.scopePrefix,
          scopeStyle = _this$props.scopeStyle,
          module = _this$props.module,
          moduleName = _this$props.moduleName,
          shadow = _this$props.shadow,
          onViewLoading = _this$props.onViewLoading,
          onViewError = _this$props.onViewError;
      var viewSrc = this.state.viewSrc;

      var _require = function _require(options) {
        return (0, _.default)(src, options);
      };

      if (!src && module) {
        src = moduleName ? module.resolveModuleUrl(moduleName) : '';

        _require = function _require(options) {
          return module.require(moduleName, options);
        };
      }

      if (viewSrc === src) return;

      if (!src) {
        return this.setState({
          loading: false,
          viewSrc: '',
          view: null
        });
      }

      this.setState({
        loading: true
      });
      onViewLoading && onViewLoading(true);
      var oldScopeName = null;

      var _finally = function _finally() {
        _this2.setState(_objectSpread({
          loading: false
        }, state), function () {
          onViewLoading && onViewLoading(false);
          if (oldScopeName && oldScopeName !== _this2.viewScopeName) _this2._destoryView(oldScopeName);
        });
      };

      var bodyEl = this.$refs.body;
      var state = {};

      _require({
        externals: externals,
        windowProxy: {
          context: this.viewContext,
          document: {
            html: this.$refs.html,
            head: this.$refs.head,
            body: this.$refs.body
          },
          addEventListener: function addEventListener(type, listener) {
            var _window;

            if (this.viewScopeName) {
              var viewContext = this.viewContext[this.viewScopeName];

              if (viewContext) {
                var listeners = viewContext && viewContext.listeners;
                if (!listeners) viewContext.listeners = [];
                listeners.push(type, listener);
              }
            }

            for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
              args[_key - 2] = arguments[_key];
            }

            return (_window = window).addEventListener.apply(_window, [type, listener].concat(args));
          },
          removeEventListener: function removeEventListener(type, listener) {
            var _window2;

            if (this.viewScopeName) {
              var viewContext = this.viewContext[this.viewScopeName];

              if (viewContext) {
                var listeners = viewContext && viewContext.listeners;

                if (listeners) {
                  var idx = listeners.findIndex(function (v) {
                    return v.listener === listener;
                  });
                  if (~idx) listeners.splice(idx, 1);
                }
              }
            }

            for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
              args[_key2 - 2] = arguments[_key2];
            }

            return (_window2 = window).removeEventListener.apply(_window2, [type, listener].concat(args));
          }
        },
        beforeSource: function beforeSource(source, type) {
          if (scopeStyle && (!shadow || !_utils.supportShadow || scopeStyle === 'always') && type === 'css') {
            source = source.replace(/([\n}])([.A-Za-z*:#[])/g, function (m, p1, p2) {
              return "".concat(p1, " .").concat(_this2.viewScopeHash, " ").concat(p2);
            });
          }

          return source;
        },
        getManifestCallback: function getManifestCallback(viewManifest) {
          var newScopeName = viewManifest.scopeName;
          if (_this2.viewScopeName === newScopeName) return;
          oldScopeName = _this2.viewScopeName;
          _this2.viewScopeName = newScopeName;
          _this2.viewScopeHash = "".concat(scopePrefix).concat((0, _hashSum.default)(newScopeName));
          if (!bodyEl.className.includes(_this2.viewScopeHash)) bodyEl.className = "".concat(bodyEl.className, " ").concat(_this2.viewScopeHash);
        }
      }).then(function (view) {
        if (view && view.__esModule) view = view.default;

        if (view.namespace && bodyEl && !bodyEl.className.includes(view.namespace)) {
          _this2.viewNamespace = view.namespace;
          bodyEl.className = "".concat(bodyEl.className, " ").concat(view.namespace);
        }

        if (typeof view === 'function' && !(0, _utils.isReactComponent)(view) && !(0, _utils.isForwardComponent)(view)) {
          view = (0, _app.createAppView)(view);
        }

        Object.assign(state, {
          view: view,
          viewSrc: src
        });

        _finally();
      }).catch(function (ex) {
        var errorView = onViewError && onViewError(ex);
        if (errorView !== undefined) Object.assign(state, {
          view: errorView,
          viewSrc: ''
        });

        _finally();
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$props2 = this.props,
          shadow = _this$props2.shadow,
          classPrefix = _this$props2.classPrefix,
          tag = _this$props2.tag,
          className = _this$props2.className,
          children = _this$props2.children,
          _this$props2$props = _this$props2.props,
          props = _this$props2$props === void 0 ? {} : _this$props2$props;
      var otherProps = {};
      Object.keys(this.props).forEach(function (key) {
        // eslint-disable-next-line react/forbid-foreign-prop-types
        if (RemoteView.propTypes[key]) return;
        otherProps[key] = _this3.props[key];
      });
      var shadowChild = shadow && _utils.supportShadow;
      var _this$state = this.state,
          loading = _this$state.loading,
          View = _this$state.view;
      return _react.default.createElement(tag, _objectSpread({
        className: "".concat(classPrefix, "view ").concat(shadowChild ? '' : "".concat(classPrefix, "view-html"), " ").concat(loading ? "".concat(classPrefix, "view-loading") : '', " ").concat(className || ''),
        ref: function ref(r) {
          if (r && !_this3.$refs.shadowRoot && shadowChild) {
            _this3.$refs.root = r;
            _this3.$refs.shadowRoot = (0, _utils.createShadowRoot)(r);
            _this3.$refs.html = (0, _utils.createDOMElement)(tag, {
              className: "".concat(classPrefix, "view-html"),
              style: {
                height: '100%'
              }
            }, _this3.$refs.shadowRoot);
            _this3.$refs.head = (0, _utils.createDOMElement)(tag, {
              className: "".concat(classPrefix, "view-head")
            }, _this3.$refs.html);
            _this3.$refs.body = (0, _utils.createDOMElement)(tag, {
              className: "".concat(classPrefix, "view-body"),
              style: {
                height: '100%'
              }
            }, _this3.$refs.html);

            _this3.forceUpdate();
          } else _this3.$refs.html = r;
        }
      }, otherProps), shadowChild ? this.$refs.body && View ? _reactDom.default.createPortal(_react.default.createElement(View, props, children), this.$refs.body) : null : [_react.default.createElement(tag, {
        className: "".concat(classPrefix, "view-head"),
        ref: function ref(r) {
          return _this3.$refs.head = r;
        }
      }), _react.default.createElement(tag, {
        className: "".concat(classPrefix, "view-body"),
        style: {
          height: '100%'
        },
        ref: function ref(r) {
          return _this3.$refs.body = r;
        }
      }, View ? _react.default.createElement(View, props, children) : null)]);
    }
  }]);

  return RemoteView;
}(_react.default.Component);

_defineProperty(RemoteView, "propTypes", {
  scopeStyle: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.string]),
  scopePrefix: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  tag: _propTypes.default.string,
  src: _propTypes.default.string,
  module: _propTypes.default.object,
  moduleName: _propTypes.default.string,
  props: _propTypes.default.object,
  externals: _propTypes.default.object,
  onViewLoading: _propTypes.default.func,
  onViewError: _propTypes.default.func
});

_defineProperty(RemoteView, "defaultProps", {
  scopePrefix: 'v-',
  classPrefix: 'import-remote-',
  tag: 'div'
});

var _default = RemoteView;
exports.default = _default;