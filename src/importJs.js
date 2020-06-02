
const { fetch, requireFromStr, DEFAULT_TIMEOUT } = require('./fetch');

module.exports = function importJs(href, timeout = DEFAULT_TIMEOUT, global) {
  return new Promise((resolve, reject) => {
    fetch(href, timeout).then(source => {
      try {
        const result = requireFromStr(source, global);
        resolve(result);
      } catch (err) { reject(err); }
    }).catch(reject);
  });
};

