const DEFAULT_TIMEOUT = 120000;

const cached = {};

function fetch(url, timeout = DEFAULT_TIMEOUT) {
  return new Promise(function (resolve, reject) {
    if (cached[url]) return resolve(cached[url]);

    const xhr = new window.XMLHttpRequest();
    let timerId;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        (timerId && clearTimeout(timerId)) || (timerId = 0);
        cached[url] = xhr.responseText;
        resolve(xhr.responseText);
      }
    };
    try {
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      xhr.send(null);

      timerId = setTimeout(() => {
        xhr.abort();
        xhr.onreadystatechange = null;
        timerId = 0;
        reject({ type: 'timeout', target: xhr });
      }, timeout);
    } catch (e) { reject(e); }
  });
}

function requireFromStr(source, global) {
  if (global) source = `with(global){return (${source})}`;
  // eslint-disable-next-line
  const fn = new Function('module', 'exports', source);
  const _module = { inBrowser: true, exports: {} };
  fn(_module, _module.exports);
  return _module.exports;
}

module.exports = {
  DEFAULT_TIMEOUT,
  fetch,
  requireFromStr
};
