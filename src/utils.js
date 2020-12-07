const DEFAULT_TIMEOUT = 120000;

const ATTR_SCOPE_NAME = 'data-remote-scope';

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

function requireFromStr(source, { global: context = global, moduleProps = {}, } = {}) {
  // eslint-disable-next-line no-useless-catch
  try {
    if (context) source = `with(__context__){\n  try {\n${source}\n  } catch(ex) {\n    console.error(ex); throw ex;\n  } \n}`;
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

function resolveRelativeUrl(url, options = {}) {
  if (!url || isAbsoluteUrl(url)) return url;
  let host = options.host || window.location.origin;

  if (/^\.\//.test(url)) {
    url = url.substr(2, url.length);
    if (!options.host) {
      host = `${host}${window.location.pathname}`;
      if (/\.(html?|js)$/.test(host)) {
        const paths = host.split('/');
        paths.pop();
        host = paths.join('/');
      }
      options.onHost && options.onHost(host);
    }
  }
  return joinUrl(host, url);
}


function joinUrl(host, path) {
  if (path && /^["'].+["']$/.test(path)) path = path.substr(1, path.length - 2);
  if (!host || isAbsoluteUrl(path)) return path;
  if (/^\/[A-Za-z]/.test(host) && path.startsWith(host)) return path;
  if (/\/$/.test(host)) host = host.substr(0, host.length - 1);
  if (/^\.\//.test(path)) path = path.substr(1, path.length);
  return `${host}${/^\//.test(path) ? path : `/${path}`}`;
}

const _toString = Object.prototype.toString;

function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function isRegExp(obj) {
  return _toString.call(obj) === '[object RegExp]';
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

function walkMainifest(target) {
  let copied = [];
  let _getItem = function (ret) {
    if (ret && ret._t && ret._v) {
      if (ret._t === 'f') {
        const [args, body, bracket] = ret._v;
        // eslint-disable-next-line no-new-func
        ret = new Function(
          ...args, 
          `"use strict";${bracket ? '' : 'return ('}\n${body}${bracket ? '' : '\n)'}`
        );
      } else if (ret._t === 'r') {
        ret = new RegExp(ret._v, ret._f);
      } else if (ret._t === 'd') {
        ret = new Date(ret._v);
      }
    }
    return ret;
  };
  function _walk(target, copied) {
    if (!target || ~copied.indexOf(target)) return target;
    let isObject;
    if (isPlainObject(target)) {
      if (target._t && target._v) return _getItem(target);
      isObject = true;
    }
    if (isObject || Array.isArray(target)) {
      copied.push(target);
      Object.keys(target).forEach(key => {
        target[key] = _walk(target[key], copied);
      });
    }

    return target;
  }


  return _walk(target, copied);
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

function isEvalDevtool(devtool) {
  return typeof devtool === 'string' && /^(eval|inline)/.test(String(devtool));
}

function requireWithVersion(module, version) {
  if (module && !module.version) innumerable(module, 'version', version);
  return module;
}

export {
  DEFAULT_TIMEOUT,
  ATTR_SCOPE_NAME,

  walkMainifest,

  checkRemoteModuleWebpack,
  requireFromStr,
  isAbsoluteUrl,
  resolveRelativeUrl,
  joinUrl,
  isRegExp,
  isPlainObject,
  isFunction,
  mergeObject,
  innumerable,
  getHostFromUrl,
  isEvalDevtool,
  requireWithVersion
};
