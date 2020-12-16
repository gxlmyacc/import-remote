
import fetch, { requireJs } from './fetch';
import { innumerable, mergeObject, requireWithVersion } from './utils';
import remote from './remote';
import RemoteModule from './module';
import createRequireFactory from './requireFactory';
import importJs from './importJs';
import importJson from './importJson';
import importCss from './importCss';
import jsonp from './jsonp';
import { satisfy, versionLt } from './semver';

// eslint-disable-next-line no-undef
const version = typeof __packageversion__ === 'undefined' ? undefined : __packageversion__;

export {
  RemoteModule,
  createRequireFactory,
  fetch,
  requireJs,
  importJs,
  importJson,
  importCss,
  jsonp,
  mergeObject,
  innumerable,
  satisfy,
  versionLt,
  requireWithVersion,
  version
};

const remoteExternal = {
  RemoteModule,
  createRequireFactory,
  fetch,
  requireJs,
  importJs,
  importJson,
  importCss,
  jsonp,
  mergeObject,
  innumerable,
  satisfy,
  versionLt,
  requireWithVersion,
  version,
  
  default: remote,
};

innumerable(remoteExternal, '__esModule', true);

remote.use = function (plugin) {
  plugin && plugin.install(remote);
};

remote.externals['import-remote'] = remoteExternal;

export default remote;
