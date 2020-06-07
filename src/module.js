import remote from './remote';

class RemoteModule {

  constructor(host, options = {}) {
    if (!host) throw new Error('[RemoteModule]`host` can not empty！');
    this.host = host;
    this.options = options;
  }

  resolveModuleUrl(moduleName = 'index.js') {
    if (!/\.js$/.test(moduleName)) moduleName += '.js';
    return `${this.host}/${moduleName}`;
  }

  isRequired(moduleName = 'index.js') {
    return Boolean(remote.cached[this.resolveModuleUrl(moduleName)]);
  }

  require(moduleName = 'index.js', options = {}) {
    return remote(this.resolveModuleUrl(moduleName), { ...this.options, ...options });
  }

}

export default RemoteModule;