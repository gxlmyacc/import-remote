import RemoteModule from './module';
import { RemoteManifest, RemoteOptions } from './types';
import createRequireFactory from './requireFactory';
import remote, { requireManifest } from './remote';

import importCss from './importCss';
import importJs, { RemoteImportOptions } from './importJs';
import importJson from './importJson';
import fetch, { requireJs, FetchOptions, RemoteModuleOptions } from './fetch';
import jsonp from './jsonp';

export * from './utils';
export * from './semver';
export * from './types';


declare var version: string;

export {
  FetchOptions,
  RemoteModuleOptions,
  RemoteImportOptions,

  RemoteOptions,
  RemoteManifest,
  RemoteModule,
  createRequireFactory,
  fetch,
  requireJs,
  importJs,
  importJson,
  importCss,
  jsonp,
  requireManifest,
  version
};

export default remote;
