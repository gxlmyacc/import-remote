
import fetch, { globalCached } from './fetch';
import { innumerable } from './utils';

/** @type {import('../types/importJson').default}  */
function importJson(url, { cached = globalCached, ...options } = {}) {
  if (!cached._json) innumerable(cached, '_json', {});
  const next = url => {
    if (cached._json[url]) return cached._json[url];

    return cached._json[url] = new Promise((resolve, reject) => {
      fetch(url, options).then(source => {
        try {
          resolve(JSON.parse(source.trim()));
        } catch (err) {
          console.error(err, source);
          reject(err);
        }
      }).catch(ex => {
        delete cached._json[url];
        return reject(ex);
      });
    });
  };
  if (url.then) return url.then(next);
  return next(url);
}

export default importJson;

