
import fetch, { globalCached } from './fetch';
import { innumerable } from './utils';

function importJson(href, { cached = globalCached, ...options } = {}) {
  if (!cached._json) innumerable(cached, '_json', {});
  if (cached._json[href]) return cached._json[href];

  return cached._json[href] = new Promise((resolve, reject) => {
    fetch(href, options).then(source => {
      try {
        resolve(JSON.parse(source.trim()));
      } catch (err) {
        console.error(err, source);
        reject(err);
      }
    }).catch(ex => {
      delete cached._json[href];
      return reject(ex);
    });
  });
}

export default importJson;

