
import { fetch, requireFromStr, DEFAULT_TIMEOUT } from './utils';

function importJs(href, { timeout = DEFAULT_TIMEOUT, global, sync, host, nocache, beforeSource } = {}) {
  return new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, nocache, beforeSource }).then(source => {
      try {
        if (host && source) {
          if (!/\/$/.test(host)) host += '/';
          source = source.replace(/\/\/# sourceURL=\[module\]\\n/g, '');
          source = source.replace(
            /\/\/# sourceURL=(webpack-internal:\/\/\/[A-z/\-_0-9.@[\]]+)\\n/g, 
            (m, p1) => '' // `//# sourceURL=${host}__get-internal-source?fileName=${encodeURIComponent(p1)}\\n`
          );
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

