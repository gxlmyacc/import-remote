"use strict";

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.function.bind");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

function jsonp(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    var script;
    var needAttach;

    if (options.key !== undefined) {
      var scripts = document.getElementsByTagName('script');

      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];

        if (s.getAttribute('src') == url || s.getAttribute('data-webpack') == options.key) {
          script = s;
          break;
        }
      }
    }

    if (!script) {
      needAttach = true;
      script = document.createElement('script');
      script.charset = 'utf-8';
      script.timeout = 120;
      script.setAttribute('data-webpack', options.key);
      script.src = url;
    }

    var timeout;

    var onScriptComplete = function onScriptComplete(prev, event) {
      // avoid mem leaks in IE.
      script.onerror = script.onload = null;
      clearTimeout(timeout);
      script.parentNode && script.parentNode.removeChild(script);
      resolve(event);
      if (prev) return prev(event);
    };

    timeout = setTimeout(onScriptComplete.bind(null, undefined, {
      type: 'timeout',
      target: script
    }), options.timeout || 120000);
    script.onerror = onScriptComplete.bind(null, script.onerror);
    script.onload = onScriptComplete.bind(null, script.onload);
    needAttach && document.head.appendChild(script);
  });
}

var _default = jsonp;
exports["default"] = _default;