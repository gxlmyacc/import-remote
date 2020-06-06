const remote = require('./remote');
const remoteModule = require('./module');

remote.cached = {};
remote.externals = {};
remote.modules = {};

remote.default = remote;
remote.remoteModule = remoteModule;

module.exports = remote;
