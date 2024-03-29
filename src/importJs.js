
import base64 from 'base-64';
import fetch, { globalCached } from './fetch';
import { innumerable, requireFromStr, isEvalDevtool, DEFAULT_TIMEOUT, transformSourcemapUrl, getCacheUrl } from './utils';

const scopeNameRegx = /\(import-remote\)\/((?:@[^/]+\/[^/]+)|(?:[^@][^/]+))/;

/** @type {import('../types/importJs').default}  */
function importJs(url, {
  cached = globalCached,
  timeout = DEFAULT_TIMEOUT,
  global, sync, cacheDB, scopeName, host, devtool, nocache, beforeSource, method,
  publicPath, sourcemapHost,
} = {}) {
  if (!cached._js) innumerable(cached, '_js', {});
  const next = url => {
    const cacheUrl = getCacheUrl(url, scopeName);
    if (cached._js[cacheUrl]) return cached._js[cacheUrl];

    const prom = new Promise((resolve, reject) => {
      fetch(url, { timeout, sync, cacheDB, nocache, beforeSource, method }).then(source => {
        try {
          const isEval = /^eval/.test(String(devtool));
          if (host && source) {
            if (!/\/$/.test(host)) host += '/';
            if (isEvalDevtool(devtool)) {
              if (isEval) {
                source = source.replace(/\/\/# sourceURL=\[module\]\\n/g, '\\n');
                source = source.replace(
                  /\/\/# sourceURL=(webpack-internal:\/\/\/[A-Za-z/\-_0-9.@+[\]]+)\\n/g,
                  (m, p1) => '\\n' // `//# sourceURL=${host}__get-internal-source?fileName=${encodeURIComponent(p1)}\\n`
                );
              }
              const regx = new RegExp(`\\/\\/# sourceMappingURL=data:application\\/json;charset=utf-8;base64,([0-9A-Za-z=/+.-]+)${
                isEval ? '\\\\n' : '(?:\\n|$)'
              }`, 'g');
              source = source.replace(
                regx,
                (m, p1) => {
                  let sourcemap = JSON.parse(base64.decode(p1));
                  sourcemap.sources = sourcemap.sources.map(src => {
                    if (scopeName) {
                      let [, srcScopeName] = src.match(scopeNameRegx) || [];
                      if (srcScopeName && srcScopeName !== scopeName) {
                        src = src.replace(scopeNameRegx, `(import-remote)/[${scopeName}]`);
                      }
                    }
                    if (/\?[a-z0-9]{4}$/.test(src)) src = src.substr(0, src.length - 5);
                    return /^https?:/.test(src) ? src : (host + src);
                  });
                  return `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64.encode(JSON.stringify(sourcemap))}${
                    isEval ? '\\n' : m.endsWith('\n') ? '\n' : ''
                  }`;
                }
              );
            } else {
              source = transformSourcemapUrl(url, source, { devtool, sourcemapHost, scopeName, host, publicPath });
            }
          }
          if (beforeSource) source = beforeSource(source, 'js', url, { isEval });
          const result = requireFromStr(source, { global, url });
          resolve(result);
        } catch (err) {
          if (err && !err.url) err.url = url;
          console.error(err,  url, source);
          reject(err);
        }
      }).catch(ex => {
        delete cached._js[cacheUrl];
        return reject(ex);
      });
    });

    cached._js[cacheUrl] = prom;

    return prom;
  };
  if (url.then) return url.then(next);
  return next(url);
}

export default importJs;

