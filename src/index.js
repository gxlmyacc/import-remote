/* eslint-disable no-proto */
const { DEFAULT_TIMEOUT } = require('./utils');
const runtime = require('./runtime');
const importJs = require('./importJs');

function remote(url, options = {}) {
  if (!window.__moduleWebpack__) window.__moduleWebpack__ = {};
  const {
    timeout = DEFAULT_TIMEOUT,
    externals = {},
  } = options;
  if (remote.cached[url]) return remote.cached[url];
  return remote.cached[url] = new Promise((resolve, _reject) => {
    const reject = () => {
      delete remote.cached[url];
      return _reject.apply(this, arguments);
    };
    importJs(url, timeout, window).then(data => {
      if (typeof data === 'function') data = data(remote, options);
      if (data.externals) {
        data.externals.forEach(key => {
          if (!externals[key] && !remote.externals[key]) {
            console.warn(`[import-remote:remote]the exteranl '${key}' not be found`);
          }
        });
      }

      const scopeName = data.scopeName || '[default]';
      if (!window.__moduleWebpack__[scopeName]) {
        const context = { window };
        // context.__proto__ = window;
        window.__moduleWebpack__[scopeName] = context;
      }

      const context = window.__moduleWebpack__[scopeName];
      
      Object.assign(externals, remote.externals);

      const __require__ = runtime(data.entrys.js, Object.assign(data, { context }));
      Promise.all(data.entrys.ids.map(id => __require__.e(id)))
        .then(v => {
          try {
            data.externals.forEach(moduleId => {
              __require__.m[moduleId] = module => module.exports = externals[moduleId];
            });
            let result = __require__(data.entryFile);
            resolve(result);
          } catch (ex) {
            console.error(ex);
            reject(ex);
          }
        })
        .catch(reject);
    }).catch(reject);
  });
}
remote.cached = {};
remote.externals = {};

module.exports = remote;
