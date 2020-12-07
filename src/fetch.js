const globalCached = window.__remoteModuleWebpack__.cached;
const queue = [];
function pushQueue(url, resolve, reject) {
  const item = { url };
  queue.push(item);
  const walk = () => {
    while (queue.length && queue[0].done) {
      queue.shift().done();
    }
  };
  return {
    success: r => {
      item.done = () => resolve(r);
      walk();
    },
    fail: r => {
      item.done = () => reject(r);
      walk();
    },
  };
}

function innumerable(
  obj,
  key,
  value,
  options = { configurable: true }
) {
  Object.defineProperty(obj, key, { value, ...options });
  return obj;
}

function fetch(url, { timeout = 120000, sync, nocache, } = {}) {
  if (!globalCached._fetched) innumerable(globalCached, '_fetched', {});
  const fetched = globalCached._fetched;

  if (fetched[url]) return fetched[url];
  return fetched[url] = new Promise(function (resolve, reject) {
    const res = pushQueue(url, resolve, reject); 

    const xhr = new window.XMLHttpRequest();
    let timerId;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        (timerId && clearTimeout(timerId)) || (timerId = 0);
        if (xhr.status === 0) {
          // timeout
          const err = new Error('fetch [' + url + '] timed out.');
          err.xhr = xhr;
          err.url = url;
          res.fail(err);
        } else if (xhr.status === 404) {
          // no update available
          const err = new Error('fetch [' + url + '] not found.');
          err.xhr = xhr;
          err.url = url;
          res.fail(err);
        } else if (xhr.status !== 200 && xhr.status !== 304) {
          // other failure
          const err = new Error('fetch [' + url + '] failed.');
          err.xhr = xhr;
          err.url = url;
          res.fail(err);
        } else {
          // success
          res.success(xhr.responseText);
        }
      }
    };
    try {
      if (nocache) url += `${~url.indexOf('?') ? '&' : '?'}_=${Date.now()}`;
      xhr.open('GET', url, !sync);
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      // if (nocache) {
      //   xhr.setRequestHeader('If-Modified-Since', '0');
      //   xhr.setRequestHeader('Cache-Control', 'no-cache');
      // }
      xhr.send(null);

      timerId = setTimeout(() => {
        xhr.abort();
        xhr.onreadystatechange = null;
        timerId = 0;
        res.fail({ type: 'timeout', target: xhr });
      }, timeout);
    } catch (e) { res.fail(e); }
  });
}

fetch.queue = queue;

function requireJs(url, options = {}) {
  if (requireJs.modules[url]) return requireJs.modules[url].exports;
  return fetch(url, options).then(src => {
    if (requireJs.modules[url]) return requireJs.modules[url].exports;

    // eslint-disable-next-line no-new-func
    const fn = new Function('module', 'exports', 'require', src);
    const _module = requireJs.modules[url] = { exports: {} };
    try {
      fn(
        _module, 
        _module.exports, 
        options.require || (name => {
          throw new Error(`[import-remote:requireJs]module [${name}] cannot be found!`);
        })
      );
    } catch (ex) {
      delete requireJs.modules[url];
      throw ex;
    }

    return _module.exports;
  });
}
requireJs.modules = {};

export {
  globalCached,
  requireJs
};

export default fetch;