import remote from './remote';
import { joinUrl } from './utils';

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

  require(moduleName = 'index.js', options = {}) {
    return remote(this.resolveModuleUrl(moduleName), { host: this.host, ...this.options, ...options });
  }

}

export default RemoteModule;