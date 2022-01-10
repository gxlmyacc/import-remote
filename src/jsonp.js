
/** @type {import('../types/jsonp').default}  */
function jsonp(url, options = {}) {
  return new Promise((resolve, reject) => {
    let script; let needAttach;
    if (options.key !== undefined) {
      let scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        let s = scripts[i];
        if (s.getAttribute('src') == url || s.getAttribute('data-webpack') == options.key) { script = s; break; }
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
    let timeout;
    let onScriptComplete = (prev, event) => {
      // avoid mem leaks in IE.
      script.onerror = script.onload = null;
      clearTimeout(timeout);
      script.parentNode && script.parentNode.removeChild(script);
      resolve(event);
      if (prev) return prev(event);
    };
    timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), options.timeout || 120000);
    script.onerror = onScriptComplete.bind(null, script.onerror);
    script.onload = onScriptComplete.bind(null, script.onload);
    needAttach && document.head.appendChild(script);
  });
}

export default jsonp;
