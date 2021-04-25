
import base64 from 'base-64';
import fetch, { globalCached, joinUrl } from './fetch';
import { innumerable, requireFromStr, isEvalDevtool, DEFAULT_TIMEOUT } from './utils';

const scopeNameRegx = /\(import-remote\)\/((?:@[^/]+\/[^/]+)|(?:[^@][^/]+))/;
const sourceMappingURLRegx = /\/\/# sourceMappingURL=([0-9A-Za-z_.-]+\.js\.map)$/;

function importJs(href, {
  cached = globalCached,
  timeout = DEFAULT_TIMEOUT,
  global, sync, scopeName, host, devtool, nocache, beforeSource, method
} = {}) {
  if (!cached._js) innumerable(cached, '_js', {});
  if (cached._js[href]) return cached._js[href];

  return cached._js[href] = new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, nocache, beforeSource, method }).then(source => {
      try {
        if (host && source) {
          if (!/\/$/.test(host)) host += '/';
          if (isEvalDevtool(devtool)) {
            const isEval = /^eval/.test(String(devtool));
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
          } else if (devtool) {
            source = source.replace(sourceMappingURLRegx,
              (m, p1) =>  `//# sourceMappingURL=${href.split('/').slice(0, -1).join('/')}/${p1}`);
          } else if (scopeName) {
            const sourcemapHost = sessionStorage.getItem(`import-remote-${scopeName}-sourcemapping-host`);
            if (sourcemapHost && href.startsWith(host)) {
              source = `${source}\n//# sourceMappingURL=${joinUrl(sourcemapHost, href.substr(host.length, href.length))}.map`;
            }
          }
        }
        if (beforeSource) source = beforeSource(source, 'js', href);
        const result = requireFromStr(source, { global });
        resolve(result);
      } catch (err) {
        if (err && !err.url) err.url = href;
        console.error(err, source);
        reject(err);
      }
    }).catch(reject);
  });
}

export default importJs;

