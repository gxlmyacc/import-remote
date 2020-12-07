import escapeStringRegexp from 'escape-string-regexp';
import { 
  DEFAULT_TIMEOUT, ATTR_SCOPE_NAME,
  joinUrl, isFunction, getHostFromUrl, resolveRelativeUrl, walkMainifest,
  innumerable, isPlainObject, checkRemoteModuleWebpack
} from './utils';
import { globalCached } from './fetch';
import createRuntime5 from './runtime5';
import { transformStyleHost, ATTR_CSS_TRANSFORMED } from './importCss';
import importJs from './importJs';
import importJson from './importJson';
import { isRequireFactory } from './requireFactory';
import { versionLt, satisfy } from './semver';

function createContext(context) {
  if (!context) context = {};
  if (!context.window) context.window = window;
  context.__context__ = context;
  return context;
}

function resolvePath(modulePath) {
  if (modulePath.includes('!')) {
    let paths = modulePath.split('!').filter(Boolean);
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

function resolveModule(external, useId, modulesMap, __require__, nodeModulesPath, currentNodeModulesPath) {
  if (!__require__.m) return;
  if (!useId) {
    if (__require__.m[external.name]) return __require__.m[external.name];
    let modulePath = resolveModulePath(external.path, nodeModulesPath, currentNodeModulesPath);
    if (__require__.m[modulePath]) return __require__(modulePath);
    return;
  }
  let modulePath = resolveModulePath(external.path, nodeModulesPath, currentNodeModulesPath);
  let moduleAsset = modulesMap[modulePath];
  let moduleId = moduleAsset && (moduleAsset.id === undefined ? modulePath : moduleAsset.id);
  if (moduleId === undefined) return;
  if (__require__.m[moduleId]) return __require__(moduleId);
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
        if (el.contentWindow && !el.contentWindow.__windowProxy__) {
          el.contentWindow.__windowProxy__ = {
            doc: {
              html: el.contentDocument, 
              body: el.contentDocument.body, 
              head: el.contentDocument.head,
              createElement() {
                return el.contentDocument.createElement(...arguments);
              },
              getElementById() {
                return el.contentDocument.getElementById(...arguments);
              }
            }
          };
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
    let el = document.createElement(tagName, options);
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
  return {
    doc,
    globals: {},
    ...windowOthers
  };
}

function getScopeName(__remoteModuleWebpack__, scopeName, host, order = 0) {
  let newScopeName = `${scopeName}${order ? `_${order}` : ''}`;
  const currentManifest = __remoteModuleWebpack__.__moduleManifests__[newScopeName];
  if (currentManifest && host && currentManifest.host && currentManifest.host !== host) {
    console.warn(`[import-remote]note: [${host}:${newScopeName}] scopename alreadly exist, will rename to [${scopeName}_${order + 1}]!`);
    return getScopeName(__remoteModuleWebpack__, scopeName, host, ++order); 
  }
  return newScopeName;
}

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

function remote(url, options = {}) {
  url = resolveRelativeUrl(url, {
    host: options.host,
    onHost: host => options.host = host
  });

  let {
    timeout = DEFAULT_TIMEOUT,
    externals = {},
    globals = {},
    isCommonModule = false,
    getManifestCallback = null,
    host = getHostFromUrl(url),
    sync = false,
    beforeSource,
    windowProxy = { document: { html: document.documentElement, body: document.body, head: document.head } },
    useEsModuleDefault = false
  } = options;
  const __remoteModuleWebpack__ = checkRemoteModuleWebpack(windowProxy.context);
  let cached = (windowProxy.context && windowProxy.context.cached) || globalCached;
  if (cached[url]) {
    return cached[url].result.then(async r => {
      getManifestCallback && (await getManifestCallback(cached[url].manifest));
      return r;
    });
  }
  cached[url] = {
    manifest: null,
    result: new Promise(async (resolve, _reject) => {
      const reject = function () {
        delete cached[url];
        return _reject.apply(this, arguments);
      };
      try {
        let manifest = await importJs(url, { timeout, global: window, nocache: true, sync, cached });
        if (isFunction(manifest)) {
          manifest = (manifest.iref ? walkMainifest : v => v)(manifest(remote, options));
        }
        
        if (!manifest.scopeName) throw new Error('[import-remote:remote]scopeName can not be empty!');
        let scopeName = getScopeName(__remoteModuleWebpack__, manifest.scopeName, host);
        if (manifest.scopeName !== scopeName) manifest.scopeName = scopeName;

        cached[url] && (cached[url].manifest = manifest);
        getManifestCallback && (await getManifestCallback(manifest));
  
        Object.assign(externals, remote.externals);
  
        let manifestExternals = manifest.externals.filter(v => !(v.name in externals) && (!v.var || !window[v.var]));

        let commonModuleOptions = manifest.commonModules || [];
        let commonModules = manifestExternals.length
          ? await Promise.all(commonModuleOptions
            .filter(m => m && (m.name && m.url))
            .map(m => {
              let url = m.url;
              let mHost = resolveRelativeUrl(isFunction(m.host) ? m.host(options, manifest) : m.host, { host });
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
                // getManifestCallback: m.scoped ? getManifestCallback : undefined,
                windowProxy: m.scoped ? windowProxy : undefined,
              });
            }))
          : [];
        commonModules = (await Promise.all(commonModules.filter(m => m).map(async m => {
          if (m.__esModule) m = m.default;
          if (!isRequireFactory(m)) return m;
          let modules = await m(manifestExternals);
          if (modules) {
            Object.keys(modules).forEach(key => {
              let idx = manifestExternals.find(v => v.name === key);
              if (~idx) manifestExternals.splice(idx, 1);
            });
          }
          return modules;
        }))).filter(Boolean);
  
        if (!__remoteModuleWebpack__.__moduleManifests__[scopeName]) {
          const moduleManifest = __remoteModuleWebpack__.__moduleManifests__[scopeName] = {};
          moduleManifest.host = host;
          moduleManifest.jsChunks = manifest.jsChunks;
          moduleManifest.cssChunks = manifest.cssChunks;
          moduleManifest.hot = manifest.hot;
          moduleManifest.useId = Boolean(manifest.entryId);
          moduleManifest.nodeModulesPath = manifest.nodeModulesPath;
          moduleManifest.entrys = {};
        }
        const moduleManifest = __remoteModuleWebpack__.__moduleManifests__[scopeName];
        moduleManifest.entrys[manifest.entryFile] = manifest;

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
          if (result === undefined && external.path) {
            commonModuleOptions.some(option => {
              const commonModuleContext = __remoteModuleWebpack__[option.name];
              const commonModuleManifest = __remoteModuleWebpack__.__moduleManifests__[option.name]; 
              result = commonModuleContext && commonModuleManifest && resolveModule(external,
                commonModuleManifest.useId,
                commonModuleManifest.__modulesMap__, 
                commonModuleContext.require || commonModuleContext.__require__,
                commonModuleManifest.nodeModulesPath,
                manifest.nodeModulesPath);
              return result !== undefined;
            });
          }
          if (result === undefined && external.var) result = window[external.var];
          if (!isShare && result === undefined) {
            console.error(`warning:[import-remote:remote]module "${scopeName}" need external "${external.name}" !`);
          }
          return result;
        };
  
        if (!__remoteModuleWebpack__[scopeName]) {
          const globalObject = manifest.windowObject || 'window';
          const newGlobalObject = manifest.globalObject || '__context__';
          const libraryTarget = manifest.libraryTarget;

          const hotUpdateGlobal = manifest.hotUpdateGlobal || 'webpackHotUpdate';
          const hotSourceRegx = hotUpdateGlobal
            ? new RegExp(`${(!libraryTarget || libraryTarget === 'var') ? '^(\\/\\*[A-z\\s*():/.",-]+\\*\\/\\n)?' : ''}${
              globalObject}\\["${hotUpdateGlobal}"\\]`)
            : null;

          const jsonpFunction = manifest.jsonpFunction || 'webpackJsonp';
          const jsonpSourceRegx = new RegExp(`${(!libraryTarget || libraryTarget === 'var') ? '^(\\/\\*[A-z\\s*():/.",-]+\\*\\/\\n)?' : ''}\\(${
            globalObject}((\\[")|\\.)${jsonpFunction}("\\])?\\s?=\\s?${
            globalObject}((\\[")|\\.)${jsonpFunction}("\\])?\\s?\\|\\|\\s?\\[\\]\\)`);

          const batchReplaces = manifest.batchReplaces && manifest.batchReplaces.map(v => {
            if (!Array.isArray(v)) return v;
            return v.map(w => {
              if (typeof w !== 'string') return w;
              return w.replace(/%SCOPE_NAME%/g, scopeName);
            });
          });

          const ctx = __remoteModuleWebpack__[scopeName] = createContext(windowProxy.context);
          ctx.__remoteModuleWebpack__ = __remoteModuleWebpack__;
          Object.assign(ctx, remote.globals, globals);
          ctx.__HOST__ = host;
          ctx.__windowProxy__ = createWindowProxy(windowProxy, {
            scoped: manifest.scopeName, host, beforeSource
          });
          ctx.require = createRuntime5({ 
            ...manifest, 
            scopeName,
            host, 
            context: ctx,
            cached,
            requireExternal,
            beforeSource(source, type) {
              if (type === 'js') {
                let sourcePrefix;
                if (jsonpSourceRegx) {
                  let match = source.match(jsonpSourceRegx);
                  [sourcePrefix] = match || [];
                  if (sourcePrefix) {
                    const newSourcePrefix1 = `(${newGlobalObject}['${jsonpFunction}']=${newGlobalObject}['${jsonpFunction}']||[])`;
                    source = (match.index ? source.substr(0, match.index) : '') 
                      + newSourcePrefix1 + source.substr(match.index + sourcePrefix.length);
                  }
                }

                if (!sourcePrefix && hotSourceRegx) {
                  let match = source.match(hotSourceRegx);
                  let [hotSourcePrefix] = match || [];
                  if (hotSourcePrefix) {
                    source = (match.index ? source.substr(0, match.index) : '') 
                      + hotUpdateGlobal + source.substr(match.index + hotSourcePrefix.length);
                  }
                }

                const checkOffset = (source, offset, match, replaceStr) => {
                  // if (/^ ?=/.test(source.substr(offset + match.length, 2))) return match;
                  if (offset && !/^(window|self|global)\./.test(match) && source[offset - 1] === '.') return match;
                  return replaceStr;
                };
                const sources = splitSource(source, /[\s<>|&{}:,;()"'+=*![\]/\\]/);
                sources.forEach((src, i) => {
                  src = batchReplace(src, [
                    [/\b(?:window\.)?document\.getElementsBy(TagName(?:NS)?|Name|ClassName)\b/g, (m, p1, offset) => checkOffset(src, offset, m, 'document.documentElement.getElementsBy' + p1)],
                    [/\b(?:window\.)?document\.querySelector(All)?\b/g, (m, p1, offset) => checkOffset(src, offset, m, 'document.documentElement.querySelector' + (p1 || ''))],
                    [/\b(?:window\.)?document\.getElementById\b/g, (m, offset) => checkOffset(src, offset, m, '__windowProxy__.doc.getElementById')],
                    [/\b(?:window\.)?document\.createElement\b/g, (m, offset) => checkOffset(src, offset, m, '__windowProxy__.doc.createElement')],
                    [/\b(?:window\.)?document\.body\b/g, (m, offset) => checkOffset(src, offset, m, '__windowProxy__.doc.body')],
                    [/\b(?:window\.)?document\.head\b/g, (m, offset) => checkOffset(src, offset, m, '__windowProxy__.doc.head')],
                    [/\b(?:window\.)?document\.documentElement\b/g,  (m, offset) => checkOffset(src, offset, m, '__windowProxy__.doc.html')],
                    ctx.__windowProxy__.addEventListener 
                      ? [/\bwindow\.addEventListener\b/g, '__windowProxy__.addEventListener']
                      : null,
                    ctx.__windowProxy__.removeEventListener
                      ? [/\bwindow\.removeEventListener\b/g, '__windowProxy__.removeEventListener']
                      : null,
                  ]);
                  if (batchReplaces) src = batchReplace(src, batchReplaces);
                  if (manifest.globalToScopes) {
                    src = batchReplace(src, manifest.globalToScopes.map(varName => {
                      if (Array.isArray(varName)) return varName;
                      return [
                        new RegExp(`\\b(?:global|window)\\.${escapeStringRegexp(varName)}\\b`),
                        `__windowProxy__.globals.${varName}`
                      ];
                    }));
                  }
                  sources[i] = src;
                });

                return sources.join('');
              }

              if (beforeSource) source = beforeSource(source, type, manifest);

              return source;
            } 
          });
        }
  
        const context = __remoteModuleWebpack__[scopeName];
  
        if (isCommonModule && moduleManifest.useId && !moduleManifest.__modulesMap__) {
          moduleManifest.__modulesMap__ = await importJson(joinUrl(host, manifest.modulesMapFile), { timeout, nocache: true, sync });
        }
      
        const __require__ = context.require || context.__require__;
        await Promise.all(manifest.entrys.ids.map(id => __require__.e(id)));
        manifest.externals.forEach(external => {
          if (__require__.m[external.id] && __require__.m[external.id].__import_remote_external__) return;
          const fn = module => {
            if (fn.__import_remote_module__) return fn.__import_remote_module__.exports;
            module.exports = requireExternal(external);
            fn.__import_remote_module__ = module;
          };
          fn.__import_remote_external__ = true;
          __require__.m[external.id] = fn;
        });

        manifest.shareModules && manifest.shareModules.forEach(item => {
          if (__require__.m[item.id] && __require__.m[item.id].__import_remote_shared__) return;
          let newModule = requireExternal(item, true);
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
            const fn = module => module.exports = newModule;
            fn.__import_remote_shared__ = true;
            __require__.m[item.id] = fn;
          }
        });

        let result = __require__(manifest.entryId || manifest.entryFile, manifest.entryFile);

        if (useEsModuleDefault && result && result.__esModule) result = result.default;
        
        resolve(result);
      } catch (ex) {
        reject(ex);
        throw ex;
      } 
    })
  };
  return cached[url].result;
}
remote.externals = {};
remote.globals = {
  // _interopRequireDefault: require('babel-runtime/helpers/interopRequireDefault').default
};

export default remote;