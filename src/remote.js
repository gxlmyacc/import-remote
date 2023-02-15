import escapeStringRegexp from 'escape-string-regexp';
import { globalCached, checkRemoteModuleWebpack, requireJs } from './fetch';
import {
  DEFAULT_TIMEOUT, ATTR_SCOPE_NAME,
  isFunction, getHostFromUrl, resolveRelativeUrl, walkMainifest,
  innumerable, isPlainObject, joinUrl, isSameHost, getCacheUrl, copyOwnProperties
} from './utils';
import createRuntime5 from './runtime5';
import { transformStyleHost, ATTR_CSS_TRANSFORMED } from './importCss';
import { isRequireFactory } from './requireFactory';
import { versionLt, satisfy } from './semver';

function createContext(context) {
  if (!context) context = {};
  if (!context.window) context.window = window;
  context._cx_ = context.__context__ = context;
  return context;
}

function checkContext(context, options = {}) {
  if (!context) return;
  if (!context._cx_) context._cx_ = context.__context__;
  if (context.__windowProxy__ && !context.__wp__) {
    const wp = context.__wp__ = context._wp_ = context.__windowProxy__;
    const doc = wp.doc;
    Object.assign(wp, {
      d: doc,
      x: doc.html,
      b: doc.body,
      h: doc.head,
      g: wp.globals,
    });
  }
  if (!context.options) innumerable(context, 'options', {});
  copyOwnProperties(context.options, options);
}

function resolvePath(modulePath) {
  if (modulePath.includes('!')) {
    const paths = modulePath.split('!').filter(Boolean);
    modulePath = paths[paths.length - 1] || '';
  }
  return modulePath.split('?')[0];
}

function resolveModulePath(modulePath, nodeModulesPath, currentNodeModulesPath) {
  if (!modulePath) return modulePath;
  nodeModulesPath = resolvePath(nodeModulesPath || '');
  currentNodeModulesPath = resolvePath(currentNodeModulesPath || '');
  if (nodeModulesPath && currentNodeModulesPath !== nodeModulesPath) {
    modulePath = modulePath.replace(currentNodeModulesPath, nodeModulesPath);
  }
  return nodeModulesPath;
}

function resolveModule(external, __require__, nodeModulesPath, currentNodeModulesPath) {
  if (!__require__.m) return;
  if (__require__.m[external.name]) return __require__.m[external.name];
  const modulePath = external.path && resolveModulePath(external.path, nodeModulesPath, currentNodeModulesPath);
  if (modulePath && __require__.m[modulePath]) return __require__(modulePath);
}

function createWindowProxy(windowProxy, { scopeName, host, beforeSource } = {}) {
  const {
    // eslint-disable-next-line no-unused-vars
    context,
    document: doc = {
      html: document.documentElement,
      body: document.body,
      head: document.head
    },
    ...windowOthers
  } = windowProxy;

  const attachIframeLoad = el => {
    if (!el || el.__import_remote_iframe_load__) return;
    el.addEventListener && el.addEventListener('load', () => {
      try {
        if (el.src && !/^data:/.test(el.src)) return;
        if (el.contentWindow && !el.contentWindow.__wp__) {
          let doc = {
            html: el.contentDocument,
            body: el.contentDocument.body,
            head: el.contentDocument.head,
            createElement() {
              return el.contentDocument.createElement(...arguments);
            },
            getElementById() {
              return el.contentDocument.getElementById(...arguments);
            }
          };
          const context = { doc, globals: {} };
          Object.assign(context, {
            d: doc,
            x: doc.html,
            b: doc.body,
            h: doc.head,
            g: context.globals,
          });
          el.contentWindow.__wp__ = el.contentWindow._wp_ = el.contentWindow.__windowProxy__ = context;
        }
      } catch (ex) { console.error(ex); }
    }, true);
    el.__import_remote_iframe_load__ = true;
  };

  doc.getElementById = function getElementByIdProxy(id, scoped) {
    if (scoped === true && !id.startsWith(scopeName)) id = `${scopeName}-${id}`;
    return document.getElementById(id);
  };
  doc.createElement = function (tagName, options) {
    const el = document.createElement(tagName, options);
    if (scopeName) el.setAttribute(ATTR_SCOPE_NAME, scopeName);
    if (el.nodeName === 'IFRAME') attachIframeLoad(el);
    if (!el.appendChild._import_remote_proxy_) {
      const _appendChild = el.appendChild;
      el.appendChild = function appendChildProxy(node, scoped) {
        if (node) {
          if (scoped === true && node.id && !node.id.startsWith(scopeName)) node.id = `${scopeName}-${node.id}`;
          if (host && node.nodeName === 'STYLE' && node.getAttribute(ATTR_CSS_TRANSFORMED) == null) {
            const text = node.innerText;
            let newText = transformStyleHost(text, host);
            if (beforeSource) newText = beforeSource(text, 'css');
            if (text !== newText) node.innerText = newText;
            node.setAttribute(ATTR_CSS_TRANSFORMED, '');
          } else if (node.nodeName === 'IFRAME') attachIframeLoad(el);
        }
        return _appendChild.call(this, node);
      };
      innumerable(el.appendChild, '_import_remote_proxy_', true);
    }
    return el;
  };
  let globals = {};
  return {
    doc,
    globals,
    d: doc,
    x: doc.html,
    b: doc.body,
    h: doc.head,
    g: globals,
    ...windowOthers
  };
}

function getScopeName(__remoteModuleWebpack__, scopeName, host, order = 0) {
  let newScopeName = `${scopeName}${order ? `_${order}` : ''}`;
  const currentManifest = __remoteModuleWebpack__.__moduleManifests__[newScopeName];
  if (currentManifest && host && currentManifest.host && !isSameHost(currentManifest.host, host)) {
    console.error(`warning:[import-remote][${host}:${newScopeName}] scopename alreadly exist, will rename to [${scopeName}_${order + 1}]!`);
    return getScopeName(__remoteModuleWebpack__, scopeName, host, ++order);
  }
  return newScopeName;
}

/** @type {import('../types/remote').batchReplace} */
function batchReplace(source, replaces) {
  replaces && replaces.filter(Boolean).forEach(([regx, replace]) => {
    source = source.replace(regx, replace);
  });
  return source;
}

const splitSourceSize = 102400;

function splitSource(source, splitRegx, len = splitSourceSize) {
  const _split = src => {
    if (src.length <= len) return [src, ''];
    while (src.length > len && !splitRegx.test(src.charAt(len - 1))) len++;
    return [src.substr(0, len), src.substr(len, src.length)];
  };
  const ret = [];
  let restSource = source;
  while (restSource) {
    [source, restSource] = _split(restSource);
    ret.push(source);
  }
  return ret;
}

function resolveResult(result, options) {
  if (options.useEsModuleDefault && result && result.__esModule) result = result.default;
  return result;
}

function requireModule(__require__, manifest) {
  if (!__require__) return;
  let result = __require__(manifest.entryId, manifest.entryFile);
  if (Array.isArray(manifest.entryId)) {
    let entryIndex = manifest.entryIndex;
    if (isFunction(entryIndex)) entryIndex = entryIndex.call(manifest, result, __require__);
    result = entryIndex == null ? result.find(v => v) : result[entryIndex];
  }
  return result;
}

function requireManifest(url, options) {
  return requireJs(url, options).then(manifest => {
    if (!isFunction(manifest) || !manifest.iref) {
      options.done && options.done();
      return manifest;
    }
    let target = manifest(remote, options, { url });
    if (target) {
      if (options.meta) target = target.meta;
      manifest = target && (manifest.iref ? walkMainifest : v => v)(target);
    }
    return manifest;
  });
}

const spacePads = new Array(100);
for (let i = 0; i < spacePads.length; i++) {
  spacePads[i] = ''.padEnd(i, ' ');
}

/**
 * @param {string} source
 * @param {number} offset
 * @param {string} match
 * @param {string} replaceStr
 */
function checkReplaceOffset(source, offset, match, replaceStr) {
  // if (/^ ?=/.test(source.substr(offset + match.length, 2))) return match;
  let newMatch = match;
  // if (offset && !/^(window|self|global|globalThis)\./.test(match)) {
  //   const [, prefixVar] = source.substr(offset - 12, 12).match(/(window|self|global|globalThis)\.$/) || [];
  //   if (prefixVar) {
  //     offset = Math.max(offset - prefixVar.length - 1, 0);
  //     newMatch = `${prefixVar}.` + match;
  //   }
  // }
  let padLen = newMatch.length - replaceStr.length;
  if (padLen > 0 && padLen < spacePads.length) replaceStr += spacePads[padLen];
  return (offset && /^[.'"$_`\\]$/.test(source[offset - 1])) ? match : replaceStr;
}

/**
 * @typedef {import('../types/types').RemoteOptions} RemoteOptions
 */


/**
 * @template T
 * @param {string} url
 * @param {RemoteOptions} [options]
 * @returns {Promise<T>}
 */
function remote(url, options = {}) {
  url = resolveRelativeUrl(url, {
    host: options.host,
    onHost: host => options.host = host
  });

  const {
    timeout = DEFAULT_TIMEOUT,
    externals = {},
    globals = {},
    getManifestCallback = null,
    onRuntimeChanged = null,
    host = getHostFromUrl(url),
    sync = false,
    sourcemapHost,
    beforeSource,
    method,
    cacheDB,
    windowProxy = { document: { html: document.documentElement, body: document.body, head: document.head } },
  } = options;
  let { scopeName } = options;
  const __remoteModuleWebpack__ = checkRemoteModuleWebpack(windowProxy.context);
  const cached = (windowProxy.context && windowProxy.context.cached) || globalCached;

  if (typeof scopeName === 'function') scopeName = scopeName(url, options);
  const cacheUrl = getCacheUrl(url, scopeName);

  if (cached[cacheUrl]) {
    return cached[cacheUrl].result.then(async r => {
      getManifestCallback && (await getManifestCallback(cached[cacheUrl].manifest));
      return resolveResult(r, options);
    });
  }
  cached[cacheUrl] = {
    manifest: null,
    result: new Promise(async (resolve, _reject) => {
      const reject = function () {
        delete cached[cacheUrl];
        return _reject.apply(this, arguments);
      };
      try {
        let isDone = false;
        const manifest = await requireManifest(url, {
          timeout,
          global: window,
          nocache: true,
          cacheDB,
          sync,
          cached,
          method,
          done: () => isDone = true
        });
        if (isDone) {
          resolve(manifest);
          return;
        }
        if (!manifest.scopeName) throw new Error('[import-remote:remote]scopeName can not be empty!');

        if (scopeName && manifest.scopeName !== scopeName) manifest.scopeName = scopeName;
        const newScopeName = getScopeName(__remoteModuleWebpack__, manifest.scopeName, host);
        if (scopeName != newScopeName) scopeName = manifest.scopeName = newScopeName;

        if (cached[cacheUrl]) cached[cacheUrl].manifest = manifest;
        getManifestCallback && (await getManifestCallback(manifest));
        if (manifest.checkManifest) await manifest.checkManifest();

        // if (__remoteModuleWebpack__[scopeName]) {
        //   const ctx = __remoteModuleWebpack__[scopeName];
        //   const m = requireModule(ctx.require, manifest, true);
        //   if (m) return resolve(m);
        // }

        Object.assign(externals, remote.externals);

        const manifestExternals = [
          ...manifest.externals,
          ...(manifest.shareModules || []).filter(v => v.shareCommon)
        ].filter(v => v && !(v.name in externals) && (!v.var || !window[v.var]));

        const commonModuleOptions = manifest.commonModules || [];
        let commonModules = manifestExternals.length
          ? await Promise.all(commonModuleOptions
            .filter(m => m && (m.url))
            .map(m => {
              let name = m.name;
              if (name) {
                if (isFunction(name)) name = name.call(m, options, manifest);
                if (name && !manifestExternals.some(v => v.name === name)) return;
              }
              let url = m.url;
              const mHost = resolveRelativeUrl(isFunction(m.host) ? m.host(options, manifest) : m.host, { host });
              if (isFunction(url)) url = url.call(m, options, manifest);
              url = resolveRelativeUrl(url, {
                host: mHost || host,
                onHost: m.host
                  ? null
                  : host => {
                    if (!m.host) m.host = host;
                  }
              });
              return remote(url, {
                isCommonModule: true,
                externals,
                globals,
                host: mHost || getHostFromUrl(url),
                sync,
                cacheDB,
                method,
                // getManifestCallback: m.scoped ? getManifestCallback : undefined,
                windowProxy: m.scoped ? windowProxy : undefined,
              }).then(result => (
                name
                  ? { [name]: (result && result.__esModule) ? result.default : result }
                  : result
              ));
            }))
          : [];
        commonModules = (await Promise.all(commonModules.filter(m => m).map(async m => {
          if (!manifestExternals.length) return;
          if (m.__esModule) m = m.default;
          const modules = isRequireFactory(m) ? (await m(manifestExternals)) : m;
          if (isPlainObject(modules)) {
            Object.keys(modules).some(key => {
              const idx = manifestExternals.find(v => v.name === key);
              if (~idx) manifestExternals.splice(idx, 1);
              return manifestExternals.length;
            });
          }
          return modules;
        }))).filter(Boolean);

        if (!__remoteModuleWebpack__.__moduleManifests__[scopeName]) {
          const moduleManifest = __remoteModuleWebpack__.__moduleManifests__[scopeName] = {};
          moduleManifest.timestamp = manifest.timestamp;
          moduleManifest.host = joinUrl(host, '');
          moduleManifest.jsChunks = manifest.jsChunks;
          moduleManifest.cssChunks = manifest.cssChunks;
          moduleManifest.hot = manifest.hot;
          moduleManifest.nodeModulesPath = manifest.nodeModulesPath;
          moduleManifest.entrys = {};
        }
        const moduleManifest = __remoteModuleWebpack__.__moduleManifests__[scopeName];
        manifest.entryFile && (moduleManifest.entrys[manifest.entryFile] = manifest);
        if (moduleManifest.timestamp && manifest.timestamp !== moduleManifest.timestamp) {
          console.error(`warning:[import-remote:remote][${scopeName}]the timestamp(${
            manifest.timestamp
          }) of [${url}] is different with the entry module(${moduleManifest.timestamp})!`);
          onRuntimeChanged && (await onRuntimeChanged(manifest, moduleManifest));
        }

        const requireExternal = (externalOrModuleId, isShare) => {
          let external = externalOrModuleId;
          if (!isPlainObject(external)) external = { name: external };
          let result = externals[external.name];
          if (result === undefined) {
            commonModules.some(m => {
              if (isFunction(m)) result = m(external);
              else result = m[external.name];
              return result !== undefined;
            });
          }
          if (result === undefined) {
            commonModuleOptions.some(option => {
              const commonModuleContext = __remoteModuleWebpack__[option.name];
              const commonModuleManifest = __remoteModuleWebpack__.__moduleManifests__[option.name];
              result = commonModuleContext && commonModuleManifest && resolveModule(
                external,
                commonModuleContext.require || commonModuleContext.__require__,
                commonModuleManifest.nodeModulesPath,
                manifest.nodeModulesPath
              );
              return result !== undefined;
            });
          }
          if (result === undefined && external.var) result = window[external.var];
          if (!isShare && result === undefined) {
            console.error(`warning:[import-remote:remote]module "${scopeName}" need external "${external.name}" !`);
          }
          return result;
        };

        let context = __remoteModuleWebpack__[scopeName];
        if (context) checkContext(context, options);
        else {
          const globalObject = manifest.windowObject || 'window';
          let newGlobalObject = manifest.globalObject || '__context__';
          const libraryTarget = manifest.libraryTarget;

          const beforeSourceRegx = manifest.beforeSourceRegx || (regxStr => regxStr);

          const hotUpdateGlobal = manifest.hotUpdateGlobal || 'webpackHotUpdate';
          let hotSourceRegx = hotUpdateGlobal
            ? new RegExp(beforeSourceRegx(`${(!libraryTarget || libraryTarget === 'var')
              ? '^(\\/\\*[A-z\\s*():/.",-]+\\*\\/\\n)?(?:"use strict";\\n?)?(\\/\\*[A-z\\s*():/.",-]+\\*\\/\\n)?'
              : ''
            }${
              globalObject}(?:(?:\\[")|\\.)${hotUpdateGlobal}(?:"\\])?`, 'hot', { remote, versionLt, satisfy }))
            : null;

          const jsonpFunction = manifest.jsonpFunction || 'webpackJsonp';
          const jsonpSourceRegx = new RegExp(beforeSourceRegx(`${
            (!libraryTarget || libraryTarget === 'var')
              ? '^(?:\\/\\*[A-Za-z0-9\\s*():/.",\\-!_$@#%&~]+\\*\\/\\n)?(?:"use strict";\\n?)?(?:\\/\\*[A-Za-z0-9\\s*():/.",\\-!_$@#%&~]+\\*\\/\\n)?'
              : ''
          }(?:var ([A-Za-z0-9_$]+);[A-Za-z0-9_$\\s=]+\\n?)?\\(${globalObject}(?:(?:\\[")|\\.)${jsonpFunction}(?:"\\])?\\s?=\\s?${
            globalObject}(?:(?:\\[")|\\.)${jsonpFunction}(?:"\\])?\\s?\\|\\|\\s?\\[\\]\\)`, 'jsonp', { remote, versionLt, satisfy }));

          const batchReplaces = manifest.batchReplaces && manifest.batchReplaces.map(v => {
            if (!Array.isArray(v)) return v;
            return v.map(w => {
              if (typeof w !== 'string') return w;
              return w.replace(/%SCOPE_NAME%/g, scopeName);
            });
          });

          const ctx = context = __remoteModuleWebpack__[scopeName] = createContext(windowProxy.context);
          if (newGlobalObject === '__context__') newGlobalObject = '_cx_';
          Object.assign(ctx, remote.globals, globals);
          innumerable(ctx, '__remoteModuleWebpack__', __remoteModuleWebpack__);
          innumerable(ctx, '__HOST__', host);
          innumerable(ctx, 'options', options);
          // innumerable(ctx, 'cached', cached);
          ctx.__wp__ = ctx._wp_ = ctx.__windowProxy__ = createWindowProxy(windowProxy, {
            scoped: manifest.scopeName, host, beforeSource
          });
          ctx.require = createRuntime5({
            ...manifest,
            scopeName,
            host,
            context: ctx,
            cached,
            cacheDB,
            sync,
            sourcemapHost: sourcemapHost || manifest.sourcemapHost,
            requireExternal,
            beforeSource(source, type, href, options = {}) {
              if (type === 'js') {
                let sourcePrefix;
                if (jsonpSourceRegx) {
                  let match = source.match(jsonpSourceRegx);
                  [sourcePrefix] = match || [];
                  if (sourcePrefix) {
                    const appVar = match[1] || '';
                    const newSourcePrefix = `${(appVar ? `var ${appVar}=${globalObject}.${appVar}=\n` : '')}(${newGlobalObject}['${jsonpFunction}'])`;
                    source = (match.index ? source.substr(0, match.index) : '')
                      + newSourcePrefix.padEnd(sourcePrefix.length, ' ')
                      + source.substr(match.index + sourcePrefix.length);
                  }
                }

                if (!sourcePrefix && hotSourceRegx) {
                  const match = source.match(hotSourceRegx);
                  const [hotSourcePrefix] = match || [];
                  if (hotSourcePrefix) {
                    const newSourcePrefix = `(${newGlobalObject}['${hotUpdateGlobal}'])`;
                    source = (match.index ? source.substr(0, match.index) : '')
                      + newSourcePrefix.padEnd(hotSourcePrefix.length, ' ')
                      + source.substr(match.index + hotSourcePrefix.length);
                  }
                }

                const sources = splitSource(source, /[\s<>|&{}:,;()"'+=*![\]/\\]/);
                sources.forEach((src, i) => {
                  src = batchReplace(src, [
                    [/\b(?:window\.)?document(\.getElementsBy(?:TagName(?:NS)?|Name|ClassName)|querySelector(All)?)\b/g, (m, p1, offset, src) => checkReplaceOffset(src, offset, m, '_wp_.d.html' + p1)],
                    [/\b(?:window\.)?document\.getElementById\b/g, (m, offset, src) => checkReplaceOffset(src, offset, m, '__wp__.d.getElementById')],
                    [/\b(?:window\.)?document\.createElement\b/g, (m, offset, src) => checkReplaceOffset(src, offset, m, '__wp__.d.createElement')],
                    [/\b(?:window\.)?document\.body\b/g, (m, offset, src) => checkReplaceOffset(src, offset, m, '__wp__.d.body')],
                    [/\b(?:window\.)?document\.head\b/g, (m, offset, src) => checkReplaceOffset(src, offset, m, '__wp__.d.head')],
                    [/\b(?:window\.)?document\.documentElement\b/g,  (m, offset, src) => checkReplaceOffset(src, offset, m, '__wp__.d.html')],
                    ctx.__wp__.addEventListener
                      ? [/\bwindow\.addEventListener\b/g, '__wp__.addEventListener']
                      : null,
                    ctx.__wp__.removeEventListener
                      ? [/\bwindow\.removeEventListener\b/g, '__wp__.removeEventListener']
                      : null,
                  ]);
                  if (batchReplaces) src = batchReplace(src, batchReplaces);
                  if (manifest.globalToScopes) {
                    src = batchReplace(src, manifest.globalToScopes.map(varName => {
                      if (Array.isArray(varName)) return varName;
                      return [
                        new RegExp(`\\b${options.isEval ? '(\\\\n)?' : ''}(?:window)\\.${escapeStringRegexp(varName)}\\b`, 'g'),
                        (m, offset, src) => checkReplaceOffset(src, offset, m, `_wp_.g.${varName}`)
                      ];
                    }));
                  }
                  sources[i] = src;
                });

                source = sources.join('');
              }

              if (ctx.options?.beforeSource) source = ctx.options.beforeSource(source, type, href, options);
              if (manifest.beforeSource) {
                source = manifest.beforeSource(
                  source,
                  type,
                  href,
                  options,
                  { versionLt, satisfy, batchReplace, checkReplaceOffset }
                );
              }

              return source;
            }
          });
          manifest.afterCreateRuntime && manifest.afterCreateRuntime(ctx.require, ctx);
          options.afterCreateRuntime && options.afterCreateRuntime(ctx.require, ctx);
        }

        let __require__ = context.require || context.__require__;

        manifest.externals.forEach(external => {
          if (__require__.m[external.id] && __require__.m[external.id].__import_remote_external__) return;
          const fn = module => {
            if (fn.__import_remote_module__) return fn.__import_remote_module__.exports;
            if (!module) module = {};
            module.exports = requireExternal(external);
            fn.__import_remote_module__ = module;
            return module.exports;
          };
          fn.__import_remote_external__ = true;
          __require__.m[external.id] = fn;
        });

        manifest.shareModules && manifest.shareModules.forEach(item => {
          let oldModule = __require__.m[item.id];
          if (oldModule && (oldModule.__import_remote_shared__ || oldModule.__import_remote_external__)) return;
          let newModule = requireExternal(item, true) || __remoteModuleWebpack__.shareModules[item.id];
          if (newModule !== undefined) {
            let itemVersion = item.version;
            if (itemVersion) {
              let getVersion = item.getVersion;
              let moduleVersion;
              if (getVersion) {
                moduleVersion = getVersion.call(item, newModule, __require__.m[item.id], __require__.m);
              } else {
                moduleVersion = newModule.version || '';
                if (!moduleVersion && newModule.__esModule && newModule.default && newModule.default.version) {
                  moduleVersion = newModule.default.version;
                }
              }
              if (isFunction(itemVersion) && !itemVersion.call(item, moduleVersion, newModule, { versionLt, satisfy })) return;
              if (!moduleVersion) return;
              if (typeof itemVersion === 'string' && !satisfy(itemVersion, moduleVersion)) return;
              if (Array.isArray(itemVersion)) {
                const [ver1, ver2] = itemVersion;
                if (ver1 && versionLt(moduleVersion, ver1)) return;
                if (ver2 && versionLt(ver2, moduleVersion, true)) return;
              }
              if (itemVersion instanceof RegExp && !itemVersion.test(moduleVersion)) return;
            }
            const fn = module => {
              if (module) module.exports = newModule;
              return newModule;
            };
            fn.__import_remote_shared__ = true;
            __require__.m[item.id] = fn;
            if (!__remoteModuleWebpack__.shareModules[item.id]) __remoteModuleWebpack__.shareModules[item.id] = newModule;
          }
        });

        // eslint-disable-next-line no-empty
        if (context.promisePending) try { await context.promisePending; } catch (ex) {}
        innumerable(context, 'promisePending', Promise.all(manifest.entrys.ids.map(id => __require__.e(id, true))));
        try {
          await context.promisePending;
        } finally { delete context.promisePending; }

        if (__require__._init) await __require__._init(manifest.remotes);

        resolve(requireModule(__require__, manifest));
      } catch (ex) {
        reject(ex);
        throw ex;
      }
    })
  };
  return cached[cacheUrl].result.then(r => resolveResult(r, options));
}

remote.externals = {};
remote.globals = {
  // _interopRequireDefault: require('babel-runtime/helpers/interopRequireDefault').default
};

export {
  requireManifest,
  batchReplace
};

export default remote;
