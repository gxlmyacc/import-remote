
import { cached, fetch, innumerable, requireFromStr, DEFAULT_TIMEOUT } from './utils';


function importJs(href, { timeout = DEFAULT_TIMEOUT, global, sync, host, nocache, beforeSource } = {}) {
  if (!cached._js) innumerable(cached, '_js', {});
  if (cached._js[href]) return cached._js[href];

  return cached._js[href] = new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, nocache, beforeSource }).then(source => {
      try {
        if (host && source) {
          if (!/\/$/.test(host)) host += '/';
          source = source.replace(/\/\/# sourceURL=\[module\]\\n/g, '\\n');
          source = source.replace(
            /\/\/# sourceURL=(webpack-internal:\/\/\/[A-z/\-_0-9.@[\]]+)\\n/g, 
            (m, p1) => '\\n' // `//# sourceURL=${host}__get-internal-source?fileName=${encodeURIComponent(p1)}\\n`
          );
          // source = source.replace(
          //   /\/\/# sourceURL=webpack-internal:\/\/\//g, 
          //   `//# sourceURL=webpack-internal:///${host}`
          // );
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

