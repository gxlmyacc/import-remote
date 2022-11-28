
import fetch, { requireJs } from './fetch';
import { innumerable, mergeObject, requireWithVersion, objectDefineProperty } from './utils';
import remote, { requireManifest } from './remote';
import RemoteModule from './module';
import createRequireFactory from './requireFactory';
import importJs from './importJs';
import importJson from './importJson';
import importCss from './importCss';
import jsonp from './jsonp';
import { satisfy, versionLt } from './semver';
import pluginVersion from '../plugin/version';

/** @type {string} */
const version = typeof __packageversion__ === 'undefined' ? undefined : __packageversion__;

export {
  RemoteModule,
  objectDefineProperty,
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
  requireManifest,
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
  requireManifest,
  version,

  default: remote,
};

innumerable(remoteExternal, '__esModule', true);

remote.use = function (plugin) {
  plugin && plugin.install(remote);
};

remote.externals['import-remote'] = remoteExternal;
Object.keys(remoteExternal).forEach(key => (key !== 'default') && innumerable(remote, key, remoteExternal[key]));
innumerable(remote, 'pv', pluginVersion);

export default remote;
