
import base64 from 'base-64';
import { innumerable, requireFromStr, isEvalDevtool, DEFAULT_TIMEOUT } from './utils';
import fetch, { globalCached } from './fetch';

const scopeNameRegx = /\(import-remote\)\/((?:@[^/]+\/[^/]+)|(?:[^@][^/]+))/;


function importJs(href, { 
  cached = globalCached, timeout = DEFAULT_TIMEOUT, global, sync, scopeName, host, devtool, nocache, beforeSource 
} = {}) {
  if (!cached._js) innumerable(cached, '_js', {});
  if (cached._js[href]) return cached._js[href];

  return cached._js[href] = new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, nocache, beforeSource }).then(source => {
      try {
        if (devtool && isEvalDevtool(devtool) && host && source) {
          if (!/\/$/.test(host)) host += '/';
          const isEval = /^eval/.test(String(devtool));
          if (isEval) {
            source = source.replace(/\/\/# sourceURL=\[module\]\\n/g, '\\n');
            source = source.replace(
              /\/\/# sourceURL=(webpack-internal:\/\/\/[A-Za-z/\-_0-9.@[\]]+)\\n/g, 
              (m, p1) => '\\n' // `//# sourceURL=${host}__get-internal-source?fileName=${encodeURIComponent(p1)}\\n`
            );
          }
          if (host) {
            const regx = new RegExp(`\\/\\/# sourceMappingURL=data:application\\/json;charset=utf-8;base64,([0-9A-Za-z=/]+)${
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
                  return /^https?:/.test(src) ? src : (host + src);
                });
                return `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64.encode(JSON.stringify(sourcemap))}${
                  isEval ? '\\n' : m.endsWith('\n') ? '\n' : ''
                }`;
              });
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

