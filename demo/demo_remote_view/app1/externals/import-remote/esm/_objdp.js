"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.objectDefineProperty = objectDefineProperty;

require("core-js/modules/es6.object.define-property");

var arePropertyDescriptorsSupported = function () {
  var obj = {};

  try {
    Object.defineProperty(obj, 'x', {
      enumerable: false,
      value: obj
    }); // eslint-disable-next-line guard-for-in

    for (var _ in obj) {
      return false;
    }

    return obj.x === obj;
  } catch (e) {
    /* this is IE 8. */
    return false;
  }
}();

var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported;

function objectDefineProperty(a, b, c) {
  if (Object.defineProperty && (supportsDescriptors || a.nodeType == 1)) {
    return Object.defineProperty(a, b, c);
  }

  a[b] = c.get ? c.get() : c.value;
  return a;
}