import requireApp, { createAppView } from './app';
import RemoteView from './view';

const external = {
  createAppView,
  requireApp,
  default: RemoteView
};

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
  requireApp
};

export default RemoteView;