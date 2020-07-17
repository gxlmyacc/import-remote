import remote from './remote';
import { joinUrl, mergeObject, innumerable } from './utils';

class RemoteModule {

  constructor(host, options = {}) {
    if (!host) throw new Error('[RemoteModule]`host` can not empty！');
    this.host = host;
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

  async prefetch(prefetchs = []) {
    const ret = {};
    prefetchs = prefetchs.slice();
    for (let i = 0; i < prefetchs.length; i++) {
      ret.push(await this.require(prefetchs[i]));
    }
    return ret;
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

}

innumerable(RemoteModule, '__import_remote_module_class__', true);

export default RemoteModule;