
import { fetch, cached, innumerable, DEFAULT_TIMEOUT } from './utils';

function importJson(href, { timeout = DEFAULT_TIMEOUT, sync, nocache } = {}) {
  if (!cached._json) innumerable(cached, '_json', {});
  if (cached._json[href]) return cached._json[href];

  return cached._json[href] = new Promise((resolve, reject) => {
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

