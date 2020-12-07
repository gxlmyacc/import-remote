import { ATTR_SCOPE_NAME, innumerable, DEFAULT_TIMEOUT, joinUrl } from './utils';
import fetch, { globalCached } from './fetch';

const ATTR_CSS_TRANSFORMED = 'data-import-remote-transformed';

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

function transformStyleHost(source, host) {
  if (!host || !source) return source;
  if (/\/$/.test(host)) host = host.substr(0, host.length - 1);
  return source.replace(/url\(([^)]+)\)/ig, (m, p1) => `url(${joinUrl(host, p1)})`);
}

function fetchStyle(href, { cached = globalCached, timeout = DEFAULT_TIMEOUT, sync, head, scopeName, host, beforeSource } = {}) {
  if (!cached._css) innumerable(cached, '_css', {});
  if (cached._css[href]) return cached._css[href];

  return cached._css[href] = new Promise((resolve, reject) => {
    if (!head) head = document.getElementsByTagName('head')[0];
    if (hasFetched(href, head)) return resolve();
    fetch(href, { timeout, sync }).then(source => {
      try {
        source = transformStyleHost(source, host);
        if (beforeSource) source = beforeSource(source, 'css', href);

        let styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.setAttribute('data-href', href);
        styleTag.setAttribute(ATTR_CSS_TRANSFORMED, '');
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

export {
  transformStyleHost,
  ATTR_CSS_TRANSFORMED
};

export default function (href, options = {}) {
  return fetchStyle(href, options);
}
