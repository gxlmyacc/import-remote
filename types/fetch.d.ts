import RemoteModule from "./module";
import {
  RemoteOptions,
  EntriesInfo,
  RemoteModuleWebpack,
  RemoteModuleRuntime
} from './types';

type FetchMethod = 'GET'|'POST'|'HEAD'|'OPTIONS';

interface FetchOptions {
  timeout?: number,
  sync?: boolean,
  cacheDB?: boolean,
  nocache?: boolean,
  method?: FetchMethod,
  headers?: Record<string, string>
}

declare function fetch<T = any>(url: string, options?: FetchOptions): Promise<T>;

declare function requireJs<T = any>(url: string, options?: FetchOptions): Promise<T>;

declare function resolveModuleUrl(host: string, moduleName?: string): string;
interface RemoteModuleOptions extends RemoteOptions {
  resolveModuleUrl?: (this: RemoteModule, host: string, moduleName: string, originResolveModuleUrl?: typeof resolveModuleUrl, sync?: boolean) => string|Promise<string>;
}

declare class AsyncRemoteModule {

  public libraryUrl: string
  public host: string
  public options: RemoteModuleOptions

  constructor(libraryUrl: string|RemoteModule, host: string, options?: RemoteModuleOptions)

  readyRuntime(): Promise<RemoteModule>

  exist(moduleName?: string, options?: FetchOptions): Promise<null|Record<string, string>>

  requireEntries<T = {}>(entriesName?: string, options?: FetchOptions): Promise<EntriesInfo>

  requireMeta<T = any>(moduleName?: string, options?: FetchOptions): Promise<T>

  require<T = any>(moduleName?: string, options?: RemoteOptions): Promise<T>

  import<T = any>(moduleName?: string, options?: RemoteOptions): Promise<T>

  [key: string]: any
}

declare global {
  interface Window {
    __remoteModuleWebpack__: RemoteModuleWebpack & {
      [key: Exclude<string, 'cached'|'__moduleManifests__'>]: RemoteModuleRuntime
    }
  }

}


declare function isAbsoluteUrl(url: string): boolean;
declare function joinUrl(host: string, path?: string): string;
declare function existModule(host: string, moduleName?: boolean, options?: RemoteModuleOptions): Promise<null|Record<string, string>>
declare function enableCacheDB(enable?: boolean): void;

export {
  FetchOptions,
  ImportRemoteCache,
  requireJs,
  resolveModuleUrl,
  AsyncRemoteModule,
  RemoteModuleOptions,
  isAbsoluteUrl,
  joinUrl,
  existModule,
  enableCacheDB
}

export default fetch;
