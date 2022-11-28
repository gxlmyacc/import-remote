import { FetchOptions } from './fetch';
import { ImportRemoteCache, SourcemapCallback, BeforeSourceCallback } from './types';

interface RemoteImportOptions extends FetchOptions {
  cached?: ImportRemoteCache,
  global?: Record<string, any>,
  scopeName?: string,
  host?: string,
  devtool?: boolean|string,
  beforeSource?: BeforeSourceCallback,
  publicPath?: string,
  sourcemapHost?: string|SourcemapCallback,
}

declare function importJs<T = any>(url: string, options?: RemoteImportOptions): Promise<T>;

export {
  RemoteImportOptions
};

export default importJs;
