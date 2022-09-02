import { objectDefineProperty } from './_objdp';

const DEFAULT_HEAD_TIMEOUT = 30000;
const TABLE_NAME = 'fetched';

function checkRemoteModuleWebpack(context = window) {
  let globalModule = context.__remoteModuleWebpack__;
  if (!globalModule) {
    context.__remoteModuleWebpack__ = globalModule = {
      __moduleManifests__: {},
      cached: {},
    };
  }
  return globalModule;
}
const globalModule = checkRemoteModuleWebpack();
const globalCached = window.__remoteModuleWebpack__.cached;
const globalDB = () => window.__remoteModuleWebpack__.db;

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

/** @type {import('../types/fetch').default} */
function fetch(url, { timeout = 120000, sync, cacheDB, nocache, method = 'GET', headers } = {}) {
  if (!globalCached._fetched) innumerable(globalCached, '_fetched', {});
  const fetched = globalCached._fetched;
  const next = url => {
    if (fetched[url]) return fetched[url];

    const isHeadRequest = ['HEAD', 'OPTIONS'].includes(method);
    const prom = new Promise(function (resolve, reject) {
      const res = pushQueue(url, resolve, r => {
        delete fetched[url];
        return reject(r);
      });

      const xhr = new XMLHttpRequest();
      let timerId;
      let isTimedOut = false;
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          (timerId && clearTimeout(timerId)) || (timerId = 0);
          if (xhr.status === 0) {
            let cb = () => {
              // timeout
              const err = new Error(`fetch [${url}] ${isTimedOut ? 'timed out' : 'failed'}.`);
              err.xhr = xhr;
              err.url = url;
              res.fail(err);
            };
            if ((cacheDB || globalModule.cacheDB) && globalDB()) {
              globalDB().get(TABLE_NAME, url).then(v => {
                console.error(`warning:[import-remtoe]fetch [ ${url} ] failed, use cacheDB's cache instead.`);
                res.success(v.text);
              }).catch(cb);
            } else cb();
          } else if (xhr.status === 404) {
            // no update available
            const err = new Error(`fetch [${url}] not found.`);
            err.xhr = xhr;
            err.url = url;
            res.fail(err);
          } else if (xhr.status !== 200 && xhr.status !== 304) {
            // other failure
            const err = new Error(`fetch [${url}] failed:${xhr.status}.`);
            err.xhr = xhr;
            err.url = url;
            res.fail(err);
          } else {
            // success
            if (isHeadRequest) {
              const headers = xhr.getAllResponseHeaders().split('\n').reduce((p, v) => {
                const [key, value] = v.split(': ');
                if (!key) return p;
                p[key] = value;
                return p;
              }, {});
              res.success(headers);
            } else {
              if ((cacheDB || globalModule.cacheDB) && globalDB()) {
                globalDB().put(TABLE_NAME, {
                  url,
                  text: xhr.responseText,
                  timestamp: Date.now(),
                  modified: xhr.getResponseHeader('last-modified')
                });
              }
              res.success(xhr.responseText);
            }
          }
        }
      };
      try {
        if (!sync) xhr.timeout = timeout;
        xhr.open(method, nocache ? (url + `${~url.indexOf('?') ? '&' : '?'}_=${Date.now()}`) : url, !sync);
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');

        if (headers) Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

        // if (nocache) {
        //   xhr.setRequestHeader('If-Modified-Since', '0');
        //   xhr.setRequestHeader('Cache-Control', 'no-cache');
        // }
        xhr.send(null);

        timerId = setTimeout(() => {
          isTimedOut = true;
          xhr.abort();
          xhr.onreadystatechange = null;
          timerId = 0;
          res.fail({ type: 'timeout', target: xhr });
        }, timeout);
      } catch (e) { res.fail(e); }
    });
    if (!isHeadRequest) fetched[url] = prom;
    return prom;
  };
  if (url.then) return url.then(next);
  return next(url);
}

fetch.queue = queue;

/** @type {import('../types/fetch').requireJs} */
function requireJs(url, options = {}) {
  const cached = options.cached || globalCached;
  if (!cached._rs) innumerable(cached, '_rs', {});
  const next = url => {
    if (cached._rs[url]) return cached._rs[url];

    return cached._rs[url] = fetch(url, options).then(src => new Promise((resolve, reject) => {
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
        resolve(_module.exports);
      } catch (ex) {
        reject(ex);
      }
    })).catch(ex => {
      delete cached._rs[url];
      throw ex;
    });
  };
  if (url.then) return url.then(next);
  return next(url);
}

/**
 * @param {string} url
 * @returns
 */
function isAbsoluteUrl(url) {
  return typeof url === 'string' && /^(((https?:)?\/\/)|(data:))/.test(url);
}

/**
 * @param {string} host
 * @param {string} [path]
 */
function joinUrl(host, path) {
  if (path && /^["'].+["']$/.test(path)) path = path.substr(1, path.length - 2);
  if (!host || isAbsoluteUrl(path) /* || /^\//.test(path) */) return path;
  if (/^\/[A-Za-z]/.test(host) && path.startsWith(host)) return path;
  if (/\/$/.test(host)) host = host.substr(0, host.length - 1);
  if (/^\.\//.test(path)) path = path.substr(1, path.length);
  return `${host}${/^\//.test(path) ? path : `/${path}`}`;
}

/**
 * @param {string} host
 * @param {string} [moduleName]
 * @param {boolean} [sync]
 */
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

/**
 * @type {new (
 *   libraryUrl: string,
 *   host: string,
 *   options?: import('../types/fetch').RemoteModuleOptions
 * ) => import('../types/fetch').AsyncRemoteModule}
 */
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

['requireMeta', 'requireEntries', 'require', 'import'].forEach(key => AsyncRemoteModule.prototype[key] = function () {
  return this.readyRuntime().then(runtime => runtime[key].apply(runtime, arguments));
});


export {
  TABLE_NAME,
  globalModule,
  globalDB,
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
