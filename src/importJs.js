
import { fetch, requireFromStr, DEFAULT_TIMEOUT } from './utils';

function importJs(href, { timeout = DEFAULT_TIMEOUT, global, sync, host, timestamp, beforeSource } = {}) {
  return new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, timestamp, beforeSource }).then(source => {
      try {
        if (host && source) {
          if (!/\/$/.test(host)) host += '/';
          source = source.replace(
            /\/\/# sourceURL=webpack-internal:\/\/\//g, 
            `//# sourceURL=webpack-internal:///${host}`
          );
        }
        if (beforeSource) source = beforeSource(source, 'js', href);
        const result = requireFromStr(source, { global });
        resolve(result);
      } catch (err) {
        console.error(err, source); 
        reject(err); 
      }
    }).catch(reject);
  });
}

export default importJs;

