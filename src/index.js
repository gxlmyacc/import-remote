import remote from './remote';
import RemoteModule from './module';
import createRequireFactory from './requireFactory';
import { innumerable } from './utils';
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

export default remote;

remote.externals['import-remote'] = {
  RemoteModule,
  createRequireFactory,
  importJs,
  importJson,
  importCss,
  default: remote
};

innumerable(remote.externals['import-remote'], '__esModule', true);
