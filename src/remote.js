const { DEFAULT_TIMEOUT } = require('./utils');
const runtime = require('./runtime');
const importJs = require('./importJs');

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


function remote(url, options = {}) {
  if (!window.__remoteModuleWebpack__) window.__remoteModuleWebpack__ = {};
  const {
    timeout = DEFAULT_TIMEOUT,
    nodeModulesPath = require.resolveWeak('import-remote').match(/^.+node_modules/) || [],
    externals = {},
  } = options;
  if (remote.cached[url]) return remote.cached[url];
  return remote.cached[url] = new Promise((resolve, _reject) => {
    const reject = () => {
      delete remote.cached[url];
      return _reject.apply(this, arguments);
    };
    return importJs(url, timeout, window).then(data => {
      try {
        if (typeof data === 'function') data = data(remote, options);
        if (data.externals) {
          data.externals.forEach(external => {
            if (!externals[external.name] && !remote.externals[external.name]) {
              console.warn(`[import-remote:remote]the exteranl '${external.name}' not be found`);
            }
          });
        }

        const resolveModule = (external, moduleNodeModulesPath) => {
          // eslint-disable-next-line
          if (!__webpack_modules__) return;
          // eslint-disable-next-line no-undef
          if (__webpack_modules__[external.name]) return __webpack_require__(external.name);
        
          let modulePath = external.path;
          if (!modulePath) return;
          if (nodeModulesPath && moduleNodeModulesPath !== nodeModulesPath) {
            modulePath = modulePath.replace(moduleNodeModulesPath, nodeModulesPath);
          }
          // eslint-disable-next-line
          if (__webpack_modules__[modulePath]) return __webpack_require__(modulePath);
          // eslint-disable-next-line
          if (__webpack_require__.rm) return __webpack_require__.rm(external, modulePath);
        };

        const scopeName = data.scopeName || '[default]';
        if (!window.__remoteModuleWebpack__[scopeName]) {
          const context = window.__remoteModuleWebpack__[scopeName] = createContext();
          context.__remoteModuleWebpack__ = window.__remoteModuleWebpack__;
          Object.assign(context, remote.globas);
          // eslint-disable-next-line
          context.__remoteModuleResolver__ = moduleId => __webpack_modules__ && __webpack_modules__[moduleId];
        }
  
        const context = window.__remoteModuleWebpack__[scopeName];
        
        Object.assign(externals, remote.externals);

        const __require__ = runtime(data.entrys.js, Object.assign(data, { context }));
        // eslint-disable-next-line no-undef
        __require__.rm = resolveModule;
        Promise.all(data.entrys.ids.map(id => __require__.e(id)))
          .then(v => {
            try {
              data.externals.forEach(external => {
                if (__require__.m[external.name] && __require__.m[external.name].__import_remote_external__) return;
                const fn = module => {
                  if (fn && fn.__import_remote_exports__) return fn.__import_remote_exports__;
                  let result = externals[external.name];
                  if (result === undefined) result = remote.modules[external.name];
                  // eslint-disable-next-line
                  if (result === undefined && external.path) result = resolveModule(external, nodeModulesPath, data.nodeModulesPath);
                  if (result === undefined && external.var) result = window[external.var];
                  module.exports = result;
                  if (module.exports !== undefined && fn) {
                    fn.__import_remote_exports__ = result;
                  }
                };
                __require__.m[external.name] = fn;
                __require__.m[external.name].__import_remote_external__ = true;
              });
              let result = __require__(data.entryFile);
              resolve(result);
            } catch (ex) {
              console.error(ex);
              reject(ex);
            }
          })
          .catch(reject);
      } catch (ex) {
        console.error(ex);
        reject(ex);
      }
    }).catch(reject);
  });
}
remote.cached = {};
remote.externals = {

};
remote.modules = {};
remote.globas = {
  _interopRequireDefault: require('babel-runtime/helpers/interopRequireDefault').default
};


module.exports = remote;