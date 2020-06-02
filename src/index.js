const { fetch, DEFAULT_TIMEOUT } = require('./utils');
const runtime = require('./runtime');

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
    fetch(url, timeout).then(data => {
      if (data.externals) {
        data.externals.forEach(key => {
          if (!externals[key] && !remote.externals[key]) {
            console.warn(`[import-remote:remote]the exteranl '${key}' not be found`);
          }
        });
      }

      const scopeName = data.scopeName || '[default]';
      if (!window.__moduleWebpack__[scopeName]) {
        window.__moduleWebpack__[scopeName] = {
          global: Object.assign(Object.assignObject.create(window), remote.externals)
        };
      }

      const context = window.__moduleWebpack__[scopeName];
      Object.assign(Object.assignObject.create(window), externals);

      const __require__ = runtime([], Object.assign(data, { context }));
      Promise.all(data.entrys.ids.map(id => __require__.e(id)))
        .then(() => resolve(__require__(data.entrys.entryFile)))
        .catch(reject);
    }).catch(reject);
  });
}
remote.cached = {};
remote.externals = {};

module.exports = remote;
