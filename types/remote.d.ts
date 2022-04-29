import { RemoteOptions, RemoteManifest } from './types';
import { FetchOptions } from './fetch';

declare function requireManifest(url: string, options?: FetchOptions): RemoteManifest;

declare function remote<T = any>(url: string, options?: RemoteOptions): Promise<T>;


declare function batchReplace(
  source: string,
  replaces: [regx: string|RegExp, replacer: string|((substring: string, ...args: any[]) => string)][]
): string;

interface remote<T> {
  use(plugin: { install(remote: remote<T>): void }): void
  readonly externals: Record<string, any>,
  readonly remote: Record<string, any>,
}

export {
  requireManifest,
  batchReplace
}

export default remote;
