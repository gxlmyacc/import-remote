import { ATTR_SCOPE_NAME, fetch, cached, innumerable, DEFAULT_TIMEOUT, joinUrl } from './utils';

function hasFetched(href, head) {
  if (!head) head = document.documentElement.getElementsByTagName('head')[0];
  let existingLinkTags = head.getElementsByTagName('link');
  for (let i = 0; i < existingLinkTags.length; i++) {
    let tag = existingLinkTags[i];
    let dataHref = tag.getAttribute('data-href') || tag.getAttribute('href');
    if (tag.rel === 'stylesheet' && (dataHref === href)) return true;
  }
  let existingStyleTags = head.getElementsByTagName('style');
  for (let i = 0; i < existingStyleTags.length; i++) {
    let tag = existingStyleTags[i];
    let dataHref = tag.getAttribute('data-href');
    if (dataHref === href) return true;
  }
  return false;
}

function fetchLink(href, { timeout = DEFAULT_TIMEOUT, head, scopeName } = {}) {
  return new Promise(((resolve, reject) => {
    if (!head) head = document.getElementsByTagName('head')[0];
    if (hasFetched(href, head)) return resolve();

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
    if (scopeName) linkTag.setAttribute(ATTR_SCOPE_NAME, scopeName);
    linkTag.href = href;


    head.appendChild(linkTag);

    timerId = setTimeout(function () {
      onStyleLoadError({ type: 'timeout', target: linkTag });
    }, timeout);
  }));
}

function fetchStyle(href, { timeout = DEFAULT_TIMEOUT, sync, head, scopeName, host, beforeSource } = {}) {
  if (!cached._css) innumerable(cached, '_css', {});
  if (cached._css[href]) return cached._css[href];

  return cached._css[href] = new Promise((resolve, reject) => {
    if (!head) head = document.getElementsByTagName('head')[0];
    if (hasFetched(href, head)) return resolve();
    fetch(href, { timeout, sync }).then(source => {
      try {
        if (host && source) {
          if (/\/$/.test(host)) host = host.substr(0, host.length - 1);
          source = source.replace(/url\(([^)]+)\)/ig, (m, p1) => `url(${joinUrl(host, p1)})`);
        }
        if (beforeSource) source = beforeSource(source, 'css', href);

        let styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.setAttribute('data-href', href);
        if (scopeName) styleTag.setAttribute(ATTR_SCOPE_NAME, scopeName);
        styleTag.innerHTML = source;
        head.appendChild(styleTag);
        resolve(styleTag);
      } catch (err) {
        console.error(err); 
        err.code = 'CSS_CHUNK_LOAD_FAILED';
        reject(err); 
      }
    }).catch(reject);
  });
}

export default function (href, { useStyle = true, ...options } = {}) {
  return useStyle
    ? fetchStyle(href, options)
    : fetchLink(href, options);
}
