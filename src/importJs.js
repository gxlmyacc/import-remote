
import { fetch, requireFromStr, DEFAULT_TIMEOUT } from './utils';

function importJs(href, { timeout = DEFAULT_TIMEOUT, global, sync, timestamp } = {}) {
  return new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, timestamp }).then(source => {
      try {
        const result = requireFromStr(source, global);
        resolve(result);
      } catch (err) {
        console.error(err); 
        reject(err); 
      }
    }).catch(reject);
  });
}

export default importJs;

