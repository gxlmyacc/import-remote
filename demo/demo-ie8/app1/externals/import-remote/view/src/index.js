import requireApp, { createAppView, RemoteApp } from './app';
import RemoteView from './view';
import { innumerable } from './utils';

const external = {
  createAppView,
  requireApp,
  default: RemoteView
};
innumerable(external, '__esModule', true);

RemoteView.install = function (remote) {
  const remoteExternal = remote.externals && remote.externals['import-remote'];
  if (!remoteExternal) return;

  const RemoteModule = remoteExternal.RemoteModule;
  const mergeObject = remoteExternal.mergeObject;
  if (RemoteModule) {
    RemoteModule.prototype.requireApp = function (moduleName = 'index.js', options = {}) {
      return requireApp(this.resolveModuleUrl(moduleName), mergeObject({}, this.options, options, { host: this.host }));
    };
  }

  remote.externals['import-remote/view'] = external;
};

export {
  createAppView,
  requireApp,
  RemoteApp
};

export default RemoteView;
