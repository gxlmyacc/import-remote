import { RemoteOptions, RemoteManifest } from './types';
import fetch, { FetchOptions, requireJs } from './fetch';
import RemoteModule from './module';
import createRequireFactory from './requireFactory';
import { satisfy, versionLt } from './semver';
import { requireWithVersion } from './utils';
import importJs from './importJs';
import importJson from './importJson';
import importCss from './importCss';
import jsonp from './jsonp';

declare function requireManifest(url: string, options?: FetchOptions): RemoteManifest;

declare function remote<T = any>(url: string, options?: RemoteOptions): Promise<T>;


declare function batchReplace(
  source: string,
  replaces: [regx: string|RegExp, replacer: string|((substring: string, ...args: any[]) => string)][]
): string;

interface remote<T> {
  use(plugin: { install(remote: remote<T>): void }): void,
  readonly externals: Record<string, any>,
  readonly remote: Record<string, any>,
  readonly version: string,
  readonly pv: number,
  readonly RemoteModule: typeof RemoteModule,
  readonly fetch: typeof fetch,
  readonly requireJs: typeof requireJs,
  readonly createRequireFactory: typeof createRequireFactory,
  readonly satisfy: typeof satisfy,
  readonly versionLt: typeof versionLt,
  readonly requireWithVersion: typeof requireWithVersion,
  readonly requireManifest: typeof requireManifest,
  readonly importJs: typeof importJs,
  readonly importJson: typeof importJson,
  readonly importCss: typeof importCss,
  readonly jsonp: typeof jsonp,
}


export {
  requireManifest,
  batchReplace
};

export default remote;
