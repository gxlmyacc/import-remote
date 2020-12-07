"use strict";

require("core-js/modules/es7.object.get-own-property-descriptors");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createShadowRoot = createShadowRoot;
exports.createDOMElement = createDOMElement;
exports.isReactComponent = isReactComponent;
exports.isForwardComponent = isForwardComponent;
exports.innumerable = innumerable;
exports.supportShadow = void 0;

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var supportShadow = Boolean(document.body.attachShadow || document.body.createShadowRoot);
exports.supportShadow = supportShadow;

function createShadowRoot(el) {
  return el.attachShadow ? el.attachShadow({
    mode: 'open'
  }) : el.createShadowRoot();
}

function isReactComponent(component) {
  return component && component.prototype && component.prototype.render && component.isReactClass;
}

function isForwardComponent(component) {
  return component && component.$$typeof === REACT_FORWARD_REF_TYPE && typeof component.render === 'function';
}

function createDOMElement(tag) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var container = arguments.length > 2 ? arguments[2] : undefined;
  var el = document.createElement(tag);
  if (props.className) el.className = props.className;

  if (props.style) {
    Object.keys(props.style).forEach(function (key) {
      return el.style[key] = props.style[key];
    });
  }

  if (container) container.appendChild(el);
  return el;
}

function innumerable(obj, key, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    configurable: true
  };
  Object.defineProperty(obj, key, _objectSpread({
    value: value
  }, options));
  return obj;
}