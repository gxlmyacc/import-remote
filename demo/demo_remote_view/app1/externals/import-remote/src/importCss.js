import fetch, { globalCached } from './fetch';
import { ATTR_SCOPE_NAME, innumerable, DEFAULT_TIMEOUT, joinUrl, transformSourcemapUrl } from './utils';

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
  return source
    .replace(/url\(([^)]+)\)/ig, (m, p1) => `url(${joinUrl(host, p1)})`);
  // .replace(/@import\s+(["'])([^"']+)["']/ig, (m, p0, p1) => `@import ${p0 + joinUrl(host, p1) + p0}`);
}

function fetchStyle(href, {
  cached = globalCached,
  timeout = DEFAULT_TIMEOUT,
  sync, head, scopeName, host, beforeSource, method,
  devtool, sourcemapHost, publicPath, webpackChunk
} = {}) {
  if (!cached._css) innumerable(cached, '_css', {});
  if (cached._css[href]) return cached._css[href];

  return cached._css[href] = new Promise((resolve, reject) => {
    // const resolve = r => {
    //   delete cached._css[href];
    //   return _resolve(r);
    // };
    // const reject = r => {
    //   delete cached._css[href];
    //   return _reject(r);
    // };
    if (!head) head = document.getElementsByTagName('head')[0];
    if (hasFetched(href, head)) return resolve();
    fetch(href, { timeout, sync, method }).then(source => {
      try {
        source = transformStyleHost(source, host);
        source = transformSourcemapUrl(href, source, { devtool, sourcemapHost, scopeName, host, publicPath, webpackChunk });

        if (beforeSource) source = beforeSource(source, 'css', href, {});

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
    }).catch(ex => {
      delete cached._css[href];
      return reject(ex);
    });
  });
}

export {
  transformStyleHost,
  ATTR_CSS_TRANSFORMED
};

export default function (href, options = {}) {
  return fetchStyle(href, options);
}
