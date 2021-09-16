
import base64 from 'base-64';
import fetch, { globalCached } from './fetch';
import { innumerable, requireFromStr, isEvalDevtool, DEFAULT_TIMEOUT, transformSourcemapUrl } from './utils';

const scopeNameRegx = /\(import-remote\)\/((?:@[^/]+\/[^/]+)|(?:[^@][^/]+))/;

function importJs(href, {
  cached = globalCached,
  timeout = DEFAULT_TIMEOUT,
  global, sync, scopeName, host, devtool, nocache, beforeSource, method,
  webpackChunk, publicPath, sourcemapHost,
} = {}) {
  if (!cached._js) innumerable(cached, '_js', {});
  if (!webpackChunk && cached._js[href]) return cached._js[href];

  const prom = new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, nocache, beforeSource, method }).then(source => {
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
            source = source.replace(regx,
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
              });
          } else {
            source = transformSourcemapUrl(href, source, { devtool, sourcemapHost, scopeName, host, publicPath, webpackChunk });
          }
        }
        if (beforeSource) source = beforeSource(source, 'js', href, { isEval });
        const result = requireFromStr(source, { global });
        resolve(result);
      } catch (err) {
        if (err && !err.url) err.url = href;
        console.error(err, source);
        reject(err);
      }
    }).catch(ex => {
      delete cached._js[href];
      return reject(ex);
    });
  });

  if (!webpackChunk) cached._js[href] = prom;

  return prom;
}

export default importJs;

