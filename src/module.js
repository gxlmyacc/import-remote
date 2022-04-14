import remote, { requireManifest } from './remote';
import fetch, { resolveModuleUrl, existModule } from './fetch';
import { mergeObject, innumerable, resolveRelativeUrl } from './utils';


/** @type {import('../types/module').RemoteModule} */
class RemoteModule {

  constructor(host, options = {}) {
    if (!options.resolveModuleUrl && !host) throw new Error('[RemoteModule]`host` can not empty！');
    this.host = resolveRelativeUrl(host);
    this.pathname = options.pathname || '';

    this.resolveModuleUrl = options.resolveModuleUrl || resolveModuleUrl;
    delete options.resolveModuleUrl;

    this.options = options || {};
  }

  external(name, module) {
    if (!this.options.externals) this.options.externals = {};
    if (typeof name === 'string') this.options.externals[name] = module;
    else Object.assign(this.options.externals, name);
  }

  isRequired(moduleName = 'index.js') {
    let url = this.resolveModuleUrl(this.host + this.pathname, moduleName, resolveModuleUrl);
    return url.then
      ? url.then(url => Boolean(remote.cached[url]))
      : Promise.resolve(Boolean(remote.cached[url]));
  }

  prefetch(prefetchs = []) {
    return Promise.all(prefetchs.slice().map(moduleName => this.require(moduleName)));
  }

  exist(moduleName = 'index.js', options = {}) {
    return existModule(this.host + this.pathname, moduleName, options);
  }

  requireEntries(entriesName = 'import-remote-entries.js', options = {}) {
    let url = this.resolveModuleUrl(this.host + this.pathname, entriesName, resolveModuleUrl);
    const next = url => fetch(url, options).then(v => (v ? JSON.parse(v) : {}));
    return url.then ? url.then(next) : next(url);
  }

  requireMeta(moduleName = 'index.js', options = {}) {
    const url = this.resolveModuleUrl(this.host + this.pathname, moduleName, resolveModuleUrl, options.sync);
    const next = url => requireManifest(url, mergeObject({ meta: true }, options)).then(r => (r && r.meta) || {});
    if (url.then) return url.then(next);
    return next(url);
  }

  requireMetaSync(moduleName = 'index.js', options = {}) {
    let result;
    this.requireMeta(moduleName, mergeObject({}, options, { sync: true }))
      .then(r => result = r);
    return result;
  }

  require(moduleName = 'index.js', options = {}) {
    const url = this.resolveModuleUrl(this.host + this.pathname, moduleName, resolveModuleUrl, options.sync);
    const next = url => {
      const _options = { ...this.options };
      return remote(url, mergeObject(_options, options, { host: this.host }));
    };
    if (url.then) return url.then(next);
    return next(url);
  }

  requireSync(moduleName = 'index.js', options = {}) {
    let result;
    this.require(moduleName, Object.assign({}, options, { sync: true }))
      .then(r => result = r);
    return result;
  }

  import(moduleName = 'index.js', options = {}) {
    return this.require(moduleName, options).then(result => {
      (result && result.__esModule) && (result = result.default);
      return result;
    });
  }

  importSync(moduleName = 'index.js', options = {}) {
    let result = this.requireSync(moduleName, options);
    (result && result.__esModule) && (result = result.default);
    return result;
  }

}

innumerable(RemoteModule, '__import_remote_module_class__', true);

export default RemoteModule;
