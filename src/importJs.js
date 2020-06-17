
import { fetch, requireFromStr, DEFAULT_TIMEOUT } from './utils';

function importJs(href, { timeout = DEFAULT_TIMEOUT, global, sync, timestamp, beforeSource } = {}) {
  return new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, timestamp, beforeSource }).then(source => {
      try {
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

