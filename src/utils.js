const DEFAULT_TIMEOUT = 120000;

const cached = {};
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

function fetch(url, { timeout = DEFAULT_TIMEOUT, sync, nocache, } = {}) {
  return new Promise(function (resolve, reject) {
    const res = pushQueue(url, resolve, reject); 

    if (cached[url] !== undefined) return res.success(cached[url]);

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
          res.success(cached[url] = xhr.responseText);
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
fetch.cached = cached;

function requireFromStr(source, { global: context, moduleProps = {}, } = {}) {
  // eslint-disable-next-line no-useless-catch
  try {
    if (context) source = `with(__context__){try { return ${source} } catch(ex) { console.error(ex); throw ex; } }`;
    // eslint-disable-next-line
    const fn = new Function('module', 'exports', '__context__', source);
    const _module = { inRemoteModule: true, exports: {}, ...moduleProps };
    fn(_module, _module.exports, context);
    return _module.exports;
  } catch (ex) {
    // console.error(ex);
    throw ex;
  }
}

function isAbsoluteUrl(url) {
  return typeof url === 'string' && /^(((https?:)?\/\/)|(data:))/.test(url);
}


function joinUrl(host, path) {
  if (!host || isAbsoluteUrl(path)) return path;
  if (/\/$/.test(host)) host = host.substr(0, host.length - 1);
  return `${host}${/^\//.test(path) ? path : `/${path}`}`;
}

const _toString = Object.prototype.toString;

function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function isFunction(fn) {
  return fn 
    && typeof fn === 'function'
    && (!fn.prototype || fn.prototype === Function || fn.constructor === Function);
}

function mergeObject(target) {
  function _mergeObject(target, source, copiedObjects) {
    if (!target) return target;
    if (!isPlainObject(source)) return target;
    copiedObjects.push({ source, target });
    Object.keys(source).forEach(key => {
      let v = source[key];
      if (isPlainObject(v)) {
        let copied = copiedObjects.find(c => c.target === v);
        if (copied) target[key] = copied.target;
        else {
          let w = target[key];
          if (!isPlainObject(w)) w = target[key] = {};
          _mergeObject(w, v, copiedObjects);
        }
      } else target[key] = v;
    });
    return target;
  }

  let ret = target;
  let copiedObjects = [];
  for (let i = 1; i < arguments.length; i++) _mergeObject(ret, arguments[i], copiedObjects);
  return ret;
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

function getHostFromUrl(url) {
  url = url.replace(/((https?:)?\/\/[^?#]*).*/g, '$1');
  if (!/\.js$/.test(url)) return url;
  let urls = url.replace(/((https?:)?\/\/[^?#]*).*/g, '$1').split('/');
  urls.pop();
  return urls.join('/');
}

export {
  DEFAULT_TIMEOUT,
  fetch,
  requireFromStr,
  isAbsoluteUrl,
  joinUrl,
  isPlainObject,
  isFunction,
  mergeObject,
  innumerable,
  getHostFromUrl
};
