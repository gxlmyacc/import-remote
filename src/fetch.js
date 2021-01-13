import { objectDefineProperty } from './_objdp';

function checkRemoteModuleWebpack(context = global) {
  if (!context.__remoteModuleWebpack__) {
    context.__remoteModuleWebpack__ = { 
      __moduleManifests__: {}, 
      cached: {},
    };
  }
  return context.__remoteModuleWebpack__;
}
checkRemoteModuleWebpack();

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
  objectDefineProperty(obj, key, { value, ...options });
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
  const cached = options.cached || globalCached;
  if (!cached._rs) innumerable(cached, '_rs', {});
  if (cached._rs[url]) return cached._rs[url];

  return cached._rs[url] = fetch(url, options).then(src => {
    // eslint-disable-next-line no-new-func
    const fn = new Function('module', 'exports', 'require', src);
    const _module = { exports: {} };
    try {
      fn(
        _module, 
        _module.exports, 
        options.require || (name => {
          throw new Error(`[import-remote:requireJs]module [${name}] cannot be found!`);
        })
      );
    } catch (ex) {
      throw ex;
    }

    return _module.exports;
  });
}

class AsyncRemoteModule {

  constructor(libraryUrl, host, options = {}) {
    if (!libraryUrl) throw new Error('[AsyncRemoteModule]libraryUrl can not be null!');
    this.libraryUrl = libraryUrl;
    this.host = host;
    this.options = options || {};
  }

  readyRuntime() {
    return requireJs(this.libraryUrl)
      .then(({ RemoteModule }) => {
        if (this.runtime) return this.runtime;
        return this.runtime = new RemoteModule(this.host, this.options);
      });
  }

}
['require', 'import', 'requireSync', 'importSync'].forEach(key => AsyncRemoteModule.prototype[key] = function () {
  return this.readyRuntime().then(runtime => runtime[key].apply(runtime, arguments));
});

export {
  globalCached,
  requireJs,
  checkRemoteModuleWebpack,
  objectDefineProperty,
  AsyncRemoteModule
};

export default fetch;