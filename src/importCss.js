import { fetch, DEFAULT_TIMEOUT } from './utils';

function hasFetched(href, head) {
  if (!head) head = document.getElementsByTagName('head')[0];
  let existingLinkTags = document.getElementsByTagName('link');
  for (let i = 0; i < existingLinkTags.length; i++) {
    let tag = existingLinkTags[i];
    let dataHref = tag.getAttribute('data-href') || tag.getAttribute('href');
    if (tag.rel === 'stylesheet' && (dataHref === href)) return true;
  }
  let existingStyleTags = document.getElementsByTagName('style');
  for (let i = 0; i < existingStyleTags.length; i++) {
    let tag = existingStyleTags[i];
    let dataHref = tag.getAttribute('data-href');
    if (dataHref === href) return true;
  }
  return false;
}

function fetchLink(href, { timeout = DEFAULT_TIMEOUT, head } = {}) {
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
    linkTag.href = href;


    head.appendChild(linkTag);

    timerId = setTimeout(function () {
      onStyleLoadError({ type: 'timeout', target: linkTag });
    }, timeout);
  }));
}

function fetchStyle(href, { timeout = DEFAULT_TIMEOUT, sync, head } = {}) {
  return new Promise((resolve, reject) => {
    if (!head) head = document.getElementsByTagName('head')[0];
    if (hasFetched(href, head)) return resolve();
    fetch(href, { timeout, sync }).then(source => {
      try {
        let styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.setAttribute('data-href', href);
        styleTag.innerHTML = source;
        head.appendChild(styleTag);
        resolve();
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
