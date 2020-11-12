import remote from './remote';
import { joinUrl, mergeObject, innumerable, resolveRelativeUrl } from './utils';

class RemoteModule {

  constructor(host, options = {}) {
    if (!host) throw new Error('[RemoteModule]`host` can not empty！');
    this.host = resolveRelativeUrl(host);
    this.options = options || {};
  }

  external(name, module) {
    if (!this.options.externals) this.options.externals = {};
    if (typeof name === 'string') this.options.externals[name] = module;
    else Object.assign(this.options.externals, name);
  }

  resolveModuleUrl(moduleName = 'index.js') {
    if (!/\.js$/.test(moduleName)) moduleName += '.js';
    return joinUrl(this.host, moduleName);
  }

  isRequired(moduleName = 'index.js') {
    return Boolean(remote.cached[this.resolveModuleUrl(moduleName)]);
  }

  prefetch(prefetchs = []) {
    return Promise.all(prefetchs.slice().map(moduleName => this.require(moduleName)));
  }

  require(moduleName = 'index.js', options = {}) {
    return remote(this.resolveModuleUrl(moduleName), mergeObject({}, this.options, options, { host: this.host }));
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