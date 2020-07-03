import { DEFAULT_TIMEOUT, joinUrl, isFunction, getHostFromUrl, innumerable } from './utils';
import createRuntime from './runtime';
import importJs from './importJs';
import importJson from './importJson';
import { isRequireFactory } from './requireFactory';

function createContext(context) {
  if (!context) context = {};
  if (!context.window) context.window = window;
  context.__context__ = context;
  return context;
}

function resolveModulePath(modulePath, nodeModulesPath, currentNodeModulesPath) {
  if (!modulePath) return modulePath;
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
  let moduleId = modulesMap[modulePath] && modulesMap[modulePath].id;
  if (moduleId === undefined) return;
  if (__require__.m[moduleId]) return __require__(moduleId);
}

function createWindowProxy(windowProxy, scopeName) {
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
  doc.getElementById = function getElementByIdProxy(id, scoped) {
    if (scoped === true && !id.startsWith(scopeName)) id = `${scopeName}-${id}`;
    return document.getElementById(id);
  };
  doc.createElement = function (tagName, options) {
    let el = document.createElement(tagName, options);
    if (scopeName) el.setAttribute('data-remote-scope', scopeName);
    if (!el.appendChild._import_remote_proxy_) {
      const _appendChild = el.appendChild;
      el.appendChild = function appendChildProxy(node, scoped) {
        if (scoped === true && node && node.id && !node.id.startsWith(scopeName)) node.id = `${scopeName}-${node.id}`;
        return _appendChild.call(this, node);
      };
      innumerable(el.appendChild, '_import_remote_proxy_', true);
    }
    return el;
  };
  return {
    doc,
    ...windowOthers
  };
}

function remote(url, options = {}) {
  if (!window.__remoteModuleWebpack__) window.__remoteModuleWebpack__ = { __moduleManifests__: {}, cached: {} };
  let {
    timeout = DEFAULT_TIMEOUT,
    externals = {},
    globals = {},
    isCommonModule = false,
    getManifestCallback = null,
    host = getHostFromUrl(url),
    sync = false,
    windowProxy = { document: { html: document.documentElement, body: document.body, head: document.head } }
  } = options;
  const cached = window.__remoteModuleWebpack__.cached;
  if (cached[url]) {
    return cached[url].result.then(async r => {
      getManifestCallback && (await getManifestCallback(cached[url].manifest));
      return r;
    });
  }
  cached[url] = {
    result: new Promise(async (resolve, _reject) => {
      const reject = function () {
        delete cached[url];
        return _reject.apply(this, arguments);
      };
      try {
        let manifest = await importJs(url, { timeout, global: window, nocache: true, sync });
        if (isFunction(manifest)) manifest = manifest(remote, options);
  
        const scopeName = manifest.scopeName;
        if (!scopeName) throw new Error('[import-remote:remote]scopeName can not be empty!');

        cached[url] && (cached[url].manifest = manifest);
        getManifestCallback && (await getManifestCallback(manifest));
  
        Object.assign(externals, remote.externals);
  
        let commonModuleOptions = manifest.commonModules || [];
        let commonModules = await Promise.all(commonModuleOptions.filter(m => m && (m.name && m.url)).map(m => remote(m.url, { 
          isCommonModule: true, 
          externals, 
          globals, 
          host: m.host || getHostFromUrl(m.url),
          sync,
          // getManifestCallback: m.scoped ? getManifestCallback : undefined,
          windowProxy: m.scoped ? windowProxy : undefined,
        })));
        let manifestExternals = manifest.externals.filter(v => !externals[v.name]);
        commonModules = (await Promise.all(commonModules.filter(m => m).map(async m => {
          if (m.__esModule) m = m.default;
          if (!isRequireFactory(m)) return;
          let modules = await m(manifestExternals);
          if (modules) {
            Object.keys(modules).forEach(key => {
              let idx = manifestExternals.find(v => v.name === key);
              if (~idx) manifestExternals.splice(idx, 1);
            });
          }
          return modules;
        }))).filter(Boolean);
  
        if (!window.__remoteModuleWebpack__.__moduleManifests__[scopeName]) {
          const moduleManifest = window.__remoteModuleWebpack__.__moduleManifests__[scopeName] = {};
          moduleManifest.jsChunks = manifest.jsChunks;
          moduleManifest.cssChunks = manifest.cssChunks;
          moduleManifest.hot = manifest.hot;
          moduleManifest.useId = Boolean(manifest.entryId);
          moduleManifest.nodeModulesPath = manifest.nodeModulesPath;
          moduleManifest.entrys = {};
        }
        const moduleManifest = window.__remoteModuleWebpack__.__moduleManifests__[scopeName];
        moduleManifest.entrys[manifest.entryFile] = manifest;
  
        if (!window.__remoteModuleWebpack__[scopeName]) {
          const ctx = window.__remoteModuleWebpack__[scopeName] = createContext(windowProxy.context);
          ctx.__remoteModuleWebpack__ = window.__remoteModuleWebpack__;
          Object.assign(ctx, remote.globals, globals);
          ctx.__HOST__ = host;
          ctx.__windowProxy__ = createWindowProxy(windowProxy, manifest.scopeName);
          ctx.__require__ = createRuntime([], { 
            ...manifest, 
            scopeName, 
            hot: manifest.hot,
            hash: manifest.hash,
            host, 
            context: ctx,
            beforeSource(source, type, href) {
              if (type === 'js') {
                source = source
                  .replace(/\b(?:window\.)?document\.getElementsBy(TagName(?:NS)?|Name|ClassName)\b/g, (m, p1) => 'document.documentElement.getElementsBy' + p1)
                  .replace(/\b(?:window\.)?document\.querySelector(All)?\b/g, (m, p1) => 'document.documentElement.querySelector' + (p1 || ''))
                  .replace(/\b(?:window\.)?document\.getElementById\b/g, '__windowProxy__.doc.getElementById')
                  .replace(/\b(?:window\.)?document\.createElement\b/g, '__windowProxy__.doc.createElement')
                  .replace(/\b(?:window\.)?document\.body\b/g, '__windowProxy__.doc.body')
                  .replace(/\b(?:window\.)?document\.head\b/g, '__windowProxy__.doc.head')
                  .replace(/\b(?:window\.)?document\.documentElement\b/g, '__windowProxy__.doc.html');
                if (ctx.__windowProxy__.addEventListener) {
                  source = source.replace(/\bwindow\.addEventListener\b/g, '__windowProxy__.addEventListener');
                }
                if (ctx.__windowProxy__.removeEventListener) {
                  source = source.replace(/\bwindow\.removeEventListener\b/g, '__windowProxy__.removeEventListener');
                }
                return source;
              }
              return source;
            } 
          });
        }
  
        const context = window.__remoteModuleWebpack__[scopeName];
  
        if (isCommonModule && moduleManifest.useId && !moduleManifest.__modulesMap__) {
          moduleManifest.__modulesMap__ = await importJson(joinUrl(host, manifest.modulesMapFile), { timeout, nocache: true, sync });
        }
      
        const __require__ = context.__require__;
        await Promise.all(manifest.entrys.ids.map(id => __require__.e(id)));
        manifest.externals.forEach(external => {
          if (__require__.m[external.id] && __require__.m[external.id].__import_remote_external__) return;
          const fn = module => {
            if (fn.__import_remote_module__) return fn.__import_remote_module__.exports;
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
                const commonModuleContext = window.__remoteModuleWebpack__[option.name];
                const commonModuleManifest = window.__remoteModuleWebpack__.__moduleManifests__[option.name]; 
                result = resolveModule(external,
                  commonModuleManifest.useId,
                  commonModuleManifest.__modulesMap__, 
                  commonModuleContext.__require__,
                  commonModuleManifest.nodeModulesPath,
                  manifest.nodeModulesPath);
                return result !== undefined;
              });
            }
            if (result === undefined && external.var) result = window[external.var];
            module.exports = result;
            if (result === undefined) {
              console.error(`warning:[import-remote:remote]module "${scopeName}" need external "${external.name}" !`);
            }
            fn.__import_remote_module__ = module;
          };
          fn.__import_remote_external__ = true;
          __require__.m[external.id] = fn;
        });
        let result = __require__(manifest.entryId || manifest.entryFile, manifest.entryFile);
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