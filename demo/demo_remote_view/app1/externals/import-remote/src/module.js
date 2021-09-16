import remote, { requireManifest } from './remote';
import { resolveModuleUrl, existModule } from './fetch';
import { mergeObject, innumerable, resolveRelativeUrl } from './utils';

class RemoteModule {

  constructor(host, options = {}) {
    if (!host) throw new Error('[RemoteModule]`host` can not empty！');
    this.host = resolveRelativeUrl(host);
    this.pathname = options.pathname || '';
    this.options = options || {};
    this.resolveModuleUrl = resolveModuleUrl;
  }

  external(name, module) {
    if (!this.options.externals) this.options.externals = {};
    if (typeof name === 'string') this.options.externals[name] = module;
    else Object.assign(this.options.externals, name);
  }

  isRequired(moduleName = 'index.js') {
    return Boolean(remote.cached[resolveModuleUrl(this.host + this.pathname, moduleName)]);
  }

  prefetch(prefetchs = []) {
    return Promise.all(prefetchs.slice().map(moduleName => this.require(moduleName)));
  }

  exist(moduleName = 'index.js', options = {}) {
    return existModule(this.host + this.pathname, moduleName, options);
  }

  requireMeta(moduleName = 'index.js', options = {}) {
    return requireManifest(resolveModuleUrl(this.host + this.pathname, moduleName), mergeObject({ meta: true }, options))
      .then(r => (r && r.meta) || {});
  }

  requireMetaSync(moduleName = 'index.js', options = {}) {
    let result;
    this.requireMeta(moduleName, mergeObject({}, options, { sync: true }))
      .then(r => result = r)
      .catch(ex => { throw ex; });
    return result;
  }

  require(moduleName = 'index.js', options = {}) {
    return remote(resolveModuleUrl(this.host + this.pathname, moduleName), mergeObject({}, this.options, options, { host: this.host }));
  }

  requireSync(moduleName = 'index.js', options = {}) {
    let result;
    this.require(moduleName, mergeObject({}, options, { sync: true }))
      .then(r => result = r)
      .catch(ex => { throw ex; });
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
