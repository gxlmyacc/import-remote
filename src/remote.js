import { DEFAULT_TIMEOUT } from './utils';
import createRuntime from './runtime';
import importJs from './importJs';

function createContext() {
  const context = {
    window
  };
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

function resolveModule(external, __require__, nodeModulesPath, moduleNodeModulesPath) {
  // eslint-disable-next-line
  if (!__require__.m) return;
  // eslint-disable-next-line no-undef
  if (__require__.m[external.name]) return __require__(external.name);

  let modulePath = external.path;
  if (!modulePath) return;
  if (nodeModulesPath && moduleNodeModulesPath !== nodeModulesPath) {
    modulePath = modulePath.replace(moduleNodeModulesPath, nodeModulesPath);
  }
  // eslint-disable-next-line
  if (__require__.m[modulePath]) return __require__(modulePath);
  // eslint-disable-next-line
  if (__require__.rm) return __require__.rm(external, modulePath);
}


function remote(url, options = {}) {
  if (!window.__remoteModuleWebpack__) window.__remoteModuleWebpack__ = { __moduleManifest__: {} };
  const {
    timeout = DEFAULT_TIMEOUT,
    nodeModulesPath = (require.resolveWeak('babel-runtime/helpers/interopRequireDefault').match(/^.+node_modules/) || [])[0],
    externals = {},
    globals = {},
    moduleResolver,
  } = options;
  if (remote.cached[url]) return remote.cached[url];
  return remote.cached[url] = new Promise((resolve, _reject) => {
    const reject = () => {
      delete remote.cached[url];
      return _reject.apply(this, arguments);
    };
    return importJs(url, timeout, window).then(manifest => {
      try {
        if (typeof manifest === 'function') manifest = manifest(remote, options);

        let commonModuleName = manifest.commonModule;
        let commonModuleUrl = '';
        if (commonModuleName && typeof manifest.commonModuleName !== 'string') {
          commonModuleName = manifest.commonModule.name;
          commonModuleUrl = manifest.commonModule.url;
        }

        const _next = () => {
          const scopeName = manifest.scopeName || '[default]';
          if (!window.__remoteModuleWebpack__.__moduleManifest__[scopeName]) {
            window.__remoteModuleWebpack__.__moduleManifest__[scopeName] = {};
          }
          window.__remoteModuleWebpack__.__moduleManifest__[scopeName][manifest.entryFile] = manifest;
  
          if (manifest.externals) {
            manifest.externals.forEach(external => {
              if (!externals[external.name] && !remote.externals[external.name]) {
                console.warn(`[import-remote:remote]the exteranl '${external.name}' not be found`);
              }
            });
          }
  
          const _resolveModule = (external, moduleNodeModulesPath) => 
            // eslint-disable-next-line no-undef
            resolveModule(external, __webpack_require__, nodeModulesPath, moduleNodeModulesPath);
  
          if (!window.__remoteModuleWebpack__[scopeName]) {
            const context = window.__remoteModuleWebpack__[scopeName] = createContext();
            context.__remoteModuleWebpack__ = window.__remoteModuleWebpack__;
            Object.assign(context, remote.globals, globals);
            context.__remoteModuleResolver__ = moduleResolver;
            context.__require__ = createRuntime([], { ...manifest, scopeName, context });
            // eslint-disable-next-line no-undef
            context.__require__.rm = _resolveModule;
            context.__nodeModulesPath__ = nodeModulesPath;
          }
    
          const context = window.__remoteModuleWebpack__[scopeName];
          
          Object.assign(externals, remote.externals);
  
          const __require__ = context.__require__;
          Promise.all(manifest.entrys.ids.map(id => __require__.e(id)))
            .then(v => {
              try {
                manifest.externals.forEach(external => {
                  if (__require__.m[external.name] && __require__.m[external.name].__import_remote_external__) return;
                  const fn = module => {
                    if (fn && fn.__import_remote_exports__) return fn.__import_remote_exports__;
                    let result = externals[external.name];
                    // eslint-disable-next-line
                    if (result === undefined && external.path) {
                      if (commonModuleName && window.__remoteModuleWebpack__[commonModuleName]) {
                        const commonModuleContext = window.__remoteModuleWebpack__[commonModuleName]; 
                        result = resolveModule(external, 
                          commonModuleContext.__require__, 
                          commonModuleContext.__nodeModulesPath__, 
                          manifest.nodeModulesPath);
                      }
                      if (result === undefined) result = _resolveModule(external, manifest.nodeModulesPath);
                    }
                    if (result === undefined && external.var) result = window[external.var];
                    if (result !== undefined && fn) fn.__import_remote_exports__ = result;
                    module.exports = result;
                  };
                  __require__.m[external.name] = fn;
                  __require__.m[external.name].__import_remote_external__ = true;
                });
                let result = __require__(manifest.entryFile);
                resolve(result);
              } catch (ex) {
                console.error(ex);
                reject(ex);
              }
            })
            .catch(reject);     
        };

        if (!commonModuleUrl) return _next();

        return remote(commonModuleUrl).then(_next);
      } catch (ex) {
        console.error(ex);
        reject(ex);
      }
    }).catch(reject);
  });
}
remote.cached = {};
remote.externals = {};
remote.globals = {
  _interopRequireDefault: require('babel-runtime/helpers/interopRequireDefault').default
};

export default remote;