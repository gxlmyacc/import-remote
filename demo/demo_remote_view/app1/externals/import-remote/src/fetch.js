import { objectDefineProperty } from './_objdp';

const DEFAULT_HEAD_TIMEOUT = 30000;

function checkRemoteModuleWebpack(context = window) {
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

function fetch(url, { timeout = 120000, sync, nocache, method = 'GET', headers } = {}) {
  if (!globalCached._fetched) innumerable(globalCached, '_fetched', {});
  const fetched = globalCached._fetched;
  if (fetched[url]) return fetched[url];

  const isHeadRequest = ['HEAD', 'OPTIONS'].includes(method);
  const prom = new Promise(function (resolve, reject) {
    const res = pushQueue(url, resolve, r => {
      delete fetched[url];
      return reject(r);
    });

    const xhr = new XMLHttpRequest();
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
          if (isHeadRequest) {
            const rheaders = xhr.getAllResponseHeaders().split('\n').reduce((p, v) => {
              const [key, value] = v.split(': ');
              if (!key) return p;
              p[key] = value;
              return p;
            }, {});
            res.success(rheaders);
          } else res.success(xhr.responseText);
        }
      }
    };
    try {
      if (nocache) url += `${~url.indexOf('?') ? '&' : '?'}_=${Date.now()}`;
      xhr.timeout = timeout;
      xhr.open(method, url, !sync);
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');

      if (headers) Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

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
  if (!isHeadRequest) fetched[url] = prom;
  return prom;
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
  }).catch(ex => {
    delete cached._rs[url];
    return ex;
  });
}

function isAbsoluteUrl(url) {
  return typeof url === 'string' && /^(((https?:)?\/\/)|(data:))/.test(url);
}

function joinUrl(host, path) {
  if (path && /^["'].+["']$/.test(path)) path = path.substr(1, path.length - 2);
  if (!host || isAbsoluteUrl(path) /* || /^\//.test(path) */) return path;
  if (/^\/[A-Za-z]/.test(host) && path.startsWith(host)) return path;
  if (/\/$/.test(host)) host = host.substr(0, host.length - 1);
  if (/^\.\//.test(path)) path = path.substr(1, path.length);
  return `${host}${/^\//.test(path) ? path : `/${path}`}`;
}

function resolveModuleUrl(host, moduleName = 'index.js') {
  if (!/\.js$/.test(moduleName)) moduleName += '.js';
  return joinUrl(host, moduleName);
}

function existModule(host, moduleName = 'index.js', options = {}) {
  return new Promise(
    resolve => fetch(resolveModuleUrl(host, moduleName), Object.assign({
      timeout: DEFAULT_HEAD_TIMEOUT,
      nocache: true,
      method: 'HEAD'
    }, options))
      .then(r => resolve(r))
      .catch(() => resolve(null))
  );
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

  exist(moduleName = 'index.js', options = {}) {
    return existModule(this.host, moduleName, options);
  }

}

['requireMeta', 'require', 'import'].forEach(key => AsyncRemoteModule.prototype[key] = function () {
  return this.readyRuntime().then(runtime => runtime[key].apply(runtime, arguments));
});

export {
  globalCached,
  requireJs,
  checkRemoteModuleWebpack,
  objectDefineProperty,
  resolveModuleUrl,
  isAbsoluteUrl,
  joinUrl,
  existModule,

  AsyncRemoteModule
};

export default fetch;
