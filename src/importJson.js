
import { fetch, DEFAULT_TIMEOUT } from './utils';

function importJson(href, { timeout = DEFAULT_TIMEOUT, global, sync, nocache } = {}) {
  return new Promise((resolve, reject) => {
    fetch(href, { timeout, sync, nocache }).then(source => {
      try {
        resolve(JSON.parse(source.trim()));
      } catch (err) {
        console.error(err, source); 
        reject(err); 
      }
    }).catch(reject);
  });
}

export default importJson;

