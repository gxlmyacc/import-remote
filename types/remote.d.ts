import { RemoteOptions, RemoteManifest } from './types';
import { FetchOptions } from './fetch';

declare function requireManifest(url: string, options?: FetchOptions): RemoteManifest;
interface remote<T = any> {
  (url: string, options?: RemoteOptions): Promise<T>;

  use(plugin: { install(remote: remote<T>): void }): void
  readonly externals: Record<string, any>,
  readonly remote: Record<string, any>,
}

export {
  requireManifest
}

export default remote;
