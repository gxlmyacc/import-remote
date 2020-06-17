import remote from './remote';
import RemoteModule from './module';
import createRequireFactory from './requireFactory';
import { innumerable } from './utils';

export {
  RemoteModule,
  createRequireFactory
};

export default remote;

remote.externals['import-remote'] = {
  RemoteModule,
  createRequireFactory,
  default: remote
};

innumerable(remote.externals['import-remote'], '__esModule', true);
