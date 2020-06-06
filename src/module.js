const remote = require('./remote');

class RemoteModule {

  constructor(host, options = { }) {
    if (!host) throw new Error('[RemoteModule]host不能为空！');
    this.host = host;
    this.options = options;
  }

  require(moduleName = 'index.js', options = {}) {
    if (!/\.js$/.test(moduleName)) moduleName += '.js';
    return remote(`${this.host}/${moduleName}`, options);
  }

}

module.exports = RemoteModule;