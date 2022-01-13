import RemoteModule from "./module";
import { RemoteManifest, RemoteOptions } from './types';

type ImportRemoteCache = {
  _rs?: Record<string, Promise<any>>,
  _js?: Record<string, Promise<any>>,
  _css?: Record<string, Promise<HTMLStyleElement>>,
  _json?: Record<string, Promise<any>>,
  _fetched?: Record<string, Promise<string>>,
}

type FetchMethod = 'GET'|'POST'|'HEAD'|'OPTIONS';

interface FetchOptions {
  timeout?: number,
  sync?: boolean,
  nocache?: boolean,
  method?: FetchMethod,
  headers?: Record<string, string>
}

declare function fetch<T = any>(url: string, options?: FetchOptions): Promise<T>;

interface RemoteRuntimeManifest {
  timestamp: number,
  host: string,
  hot: boolean,
  jsChunks: Record<string|number, string>,
  cssChunks: Record<string|number, string>,
  entrys: Record<string, RemoteManifest>,
  nodeModulesPath: string
}


type RemoteModuleWebpack = {
  __moduleManifests__: Record<string, RemoteRuntimeManifest>,
  cached: ImportRemoteCache,
};

type RemoteModuleRuntime = {
  require<T>(moduleId: string|number, entryFile?: string): T,
  webpackHotUpdate(chunkId: string|number, moreModules: Record<string, any>, runtime: RemoteModuleRuntime): void,
  window: Window,
  __context__: RemoteModuleRuntime,
  __windowProxy__: {
    doc: {
      body: HTMLElement,
      createElement(tagName: string, options?: ElementCreationOptions): HTMLElement,
      getElementById(elementId: string, scoped?: boolean): HTMLElement | null;
      head: HTMLElement,
      html: HTMLElement,
    },
    globals: Record<string, any>,
    __REACT_ERROR_OVERLAY_GLOBAL_HOOK__: any
  }
  readonly webpackChunk: [string[], Record<string, any>[]][],
  readonly __HOST__: string
  readonly __remoteModuleWebpack__: RemoteModuleWebpack
}

declare function requireJs<T = any>(url: string, options?: FetchOptions): Promise<T>;

declare function resolveModuleUrl(host: string, moduleName?: string): string;
interface RemoteModuleOptions extends RemoteOptions {
  resolveModuleUrl?: (this: RemoteModule, host: string, moduleName: string, originResolveModuleUrl?: typeof resolveModuleUrl, sync?: boolean) => string|Promise<string>;
}

declare class AsyncRemoteModule {

  public libraryUrl: string
  public host: string
  public options: RemoteModuleOptions

  constructor(libraryUrl: string, host: string, options?: RemoteModuleOptions)

  readyRuntime(): Promise<RemoteModule>

  exist(moduleName?: string, options?: FetchOptions): Promise<null|Record<string, string>>

  requireMeta<T = any>(moduleName?: string, options?: FetchOptions): Promise<T>

  require<T = any>(moduleName?: string, options?: RemoteOptions): Promise<T>

  import<T = any>(moduleName?: string, options?: RemoteOptions): Promise<T>
}

declare global {
  interface Window {
    __remoteModuleWebpack__: RemoteModuleWebpack & {
      [key: Exclude<string, 'cached'|'__moduleManifests__'>]: RemoteModuleRuntime
    }
  }

}

export {
  FetchOptions,
  ImportRemoteCache,
  requireJs,
  resolveModuleUrl,
  AsyncRemoteModule,
  RemoteModuleOptions
}

export default fetch;
