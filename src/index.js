import remote from './remote';
import RemoteModule from './module';
import createRequireFactory from './requireFactory';
import { innumerable } from './utils';
import importJs from './importJs';
import importJson from './importJson';

export {
  RemoteModule,
  createRequireFactory,
  importJs,
  importJson
};

export default remote;

remote.externals['import-remote'] = {
  RemoteModule,
  createRequireFactory,
  importJs,
  importJson,
  default: remote
};

innumerable(remote.externals['import-remote'], '__esModule', true);
