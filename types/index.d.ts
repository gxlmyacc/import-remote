import RemoteModule from './module';
import { RemoteManifest, RemoteOptions } from './types';
import createRequireFactory from './requireFactory';
import remote from './remote';

import importCss from './importCss';
import importJs from './importJs';
import importJson from './importJson';
import fetch, { FetchOptions, requireJs } from './fetch';
import jsonp from './jsonp';

export * from './utils';
export * from './semver';

declare function requireManifest(url: string, options?: FetchOptions): RemoteManifest;

declare var version: string;

export {
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
