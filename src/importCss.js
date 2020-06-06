const { DEFAULT_TIMEOUT } = require('./utils');

module.exports = function (href, timeout = DEFAULT_TIMEOUT, head) {
  return new Promise(((resolve, reject) => {
    let existingLinkTags = document.getElementsByTagName('link');
    for (let i = 0; i < existingLinkTags.length; i++) {
      let tag = existingLinkTags[i];
      let dataHref = tag.getAttribute('data-href') || tag.getAttribute('href');
      if (tag.rel === 'stylesheet' && (dataHref === href)) return resolve();
    }
    let existingStyleTags = document.getElementsByTagName('style');
    for (let i = 0; i < existingStyleTags.length; i++) {
      let tag = existingStyleTags[i];
      let dataHref = tag.getAttribute('data-href');
      if (dataHref === href) return resolve();
    }

    let timerId;
    let linkTag = document.createElement('link');

    let onStyleLoadError = function (event) {
      // avoid mem leaks in IE.
      linkTag.onerror = linkTag.onload = null;
      clearTimeout(timerId);

      let errorType = event && (event.type === 'load' ? 'missing' : event.type);
      // eslint-disable-next-line no-mixed-operators
      let realSrc = event && event.target && event.target.src || href;
      let err = new Error('Loading CSS [' + href + '] failed.\n(' + errorType + ': ' + realSrc + ')');
      err.code = 'CSS_CHUNK_LOAD_FAILED';
      err.type = errorType;
      err.request = realSrc;

      linkTag.parentNode.removeChild(linkTag);
      reject(err);
    };

    linkTag.rel = 'stylesheet';
    linkTag.type = 'text/css';
    linkTag.onload = resolve;
    linkTag.onerror = onStyleLoadError;
    linkTag.href = href;

    if (!head) head = document.getElementsByTagName('head')[0];
    head.appendChild(linkTag);

    timerId = setTimeout(function () {
      onStyleLoadError({ type: 'timeout', target: linkTag });
    }, timeout);
  }));
};
