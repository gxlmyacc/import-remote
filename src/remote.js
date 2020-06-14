import { DEFAULT_TIMEOUT, joinUrl, isFunction, getHostFromUrl } from './utils';
import createRuntime from './runtime';
import importJs from './importJs';
import importJson from './importJson';
import { isRequireFactory } from './requireFactory';

function createContext() {
  const context = {
    window
  };
  context.__context__ = context;
  // Object.setPrototypeOf(context, Object.getPrototypeOf(window));
  // const keys = new Set(Object.keys(window));
  // Object.getOwnPropertyNames(window).forEach(key => keys.add(key));
  // keys.forEach(key => {
  //   const descriptor = Object.getOwnPropertyDescriptor(window, key);
  //   if (!descriptor) return;
  //   if (key === 'window') descriptor.value = context;
  //   else if (descriptor.value !== undefined) {
  //     // if (key.substr(0, 2) === 'on') {
  //     delete descriptor.value;
  //     delete descriptor.writable;
  //     descriptor.get = function () {
  //       return window[key];
  //     };
  //     descriptor.set = function (v) {
  //       return window[key] = v;
  //     };
  //     // }
  //   }
  //   Object.defineProperty(context, key, descriptor);
  // });
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

function remote(url, options = {}) {
  if (!window.__remoteModuleWebpack__) window.__remoteModuleWebpack__ = { __moduleManifests__: {}, cached: {} };
  let {
    timeout = DEFAULT_TIMEOUT,
    externals = {},
    globals = {},
    isCommonModule = false,
    host = '',
    sync = false,
  } = options;
  const cached = window.__remoteModuleWebpack__.cached;
  if (cached[url]) return cached[url];
  return cached[url] = new Promise(async (resolve, _reject) => {
    const reject = () => {
      delete cached[url];
      return _reject.apply(this, arguments);
    };
    try {
      let manifest = await importJs(url, { timeout, global: window, timestamp: true, sync });
      if (isFunction(manifest)) manifest = manifest(remote, options);

      const scopeName = manifest.scopeName;
      if (!scopeName) throw new Error('[import-remote:remote]scopeName can not be empty!');

      Object.assign(externals, remote.externals);

      let commonModuleOptions = manifest.commonModules || [];
      let commonModules = await Promise.all(commonModuleOptions.filter(m => m && (m.name && m.url)).map(m => remote(m.url, { 
        isCommonModule: true, 
        externals, 
        globals, 
        host: m.host || getHostFromUrl(m.url),
        sync,
      })));
      let manifestExternals = manifest.externals.filter(v => !externals[v.name]);
      commonModules = await Promise.all(commonModules.filter(m => m).map(async m => {
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
      }));

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
        const ctx = window.__remoteModuleWebpack__[scopeName] = createContext();
        ctx.__remoteModuleWebpack__ = window.__remoteModuleWebpack__;
        Object.assign(ctx, remote.globals, globals);
        ctx.__HOST__ = host;
        ctx.__require__ = createRuntime([], { ...manifest, scopeName, host, context: ctx, });
      }

      const context = window.__remoteModuleWebpack__[scopeName];

      if (isCommonModule && moduleManifest.useId && !moduleManifest.__modulesMap__) {
        moduleManifest.__modulesMap__ = await importJson(joinUrl(host, manifest.modulesMapFile), { timeout, timestamp: true, sync });
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
      let result = __require__(manifest.entryId || manifest.entryFile);
      resolve(result);
    } catch (ex) {
      reject(ex);
      throw ex;
    } 
  });
}
remote.externals = {};
remote.globals = {
  // _interopRequireDefault: require('babel-runtime/helpers/interopRequireDefault').default
};

export default remote;