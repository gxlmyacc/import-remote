let arePropertyDescriptorsSupported = (function () {
  let obj = {};
  try {
    Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
    // eslint-disable-next-line guard-for-in
    for (let _ in obj) return false;
    return obj.x === obj;
  } catch (e) {
    /* this is IE 8. */
    return false;
  }
})();
let supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported;

function objectDefineProperty(a, b, c) {
  if (Object.defineProperty && (supportsDescriptors || a.nodeType == 1)) {
    return Object.defineProperty(a, b, c);
  }
  a[b] = c.get ? c.get() : c.value;
  return a;
}

export {
  objectDefineProperty
};