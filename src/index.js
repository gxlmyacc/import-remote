import remote from './remote';
import RemoteModule from './module';
import createRequireFactory from './requireFactory';
import { innumerable, mergeObject } from './utils';
import importJs from './importJs';
import importJson from './importJson';
import importCss from './importCss';

export {
  RemoteModule,
  createRequireFactory,
  importJs,
  importJson,
  importCss
};

const remoteExternal = {
  RemoteModule,
  createRequireFactory,
  importJs,
  importJson,
  importCss,
  mergeObject,
  default: remote
};

remote.use = function (plugin) {
  plugin && plugin.install(remote);
};

remote.externals['import-remote'] = remoteExternal;

innumerable(remote.externals['import-remote'], '__esModule', true);

export default remote;
