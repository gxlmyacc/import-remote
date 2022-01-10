import { RemoteOptions } from './types';

interface remote<T = any> {
  (url: string, options?: RemoteOptions): Promise<T>;

  use(plugin: { install(remote: remote<T>): void }): void
  readonly externals: Record<string, any>,
  readonly remote: Record<string, any>,
}

export default remote;
