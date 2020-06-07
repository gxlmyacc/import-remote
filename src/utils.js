const DEFAULT_TIMEOUT = 120000;

const cached = {};

function fetch(url, { timeout = DEFAULT_TIMEOUT, sync } = {}) {
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
      url += `${~url.indexOf('?') ? '&' : '?'}_=${Date.now()}`;
      xhr.open('GET', url, !sync);
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

function requireFromStr(source, context) {
  // eslint-disable-next-line no-useless-catch
  try {
    if (context) source = `with(__context__){try { return ${source} } catch(ex) { console.error(ex); throw ex; } }`;
    // eslint-disable-next-line
    const fn = new Function('module', 'exports', '__context__', source);
    const _module = { inBrowser: true, exports: {} };
    fn(_module, _module.exports, context);
    return _module.exports;
  } catch (ex) {
    // console.error(ex);
    throw ex;
  }
}

export {
  DEFAULT_TIMEOUT,
  fetch,
  requireFromStr
};
