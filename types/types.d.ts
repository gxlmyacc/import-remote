import {  versionLt, satisfy } from './semver';
import { batchReplace } from './remote';
import IndexedDBProxy from './db';

type ShareModule = {
  name: string,
  id: string|number,
  var?: string,
  version?: string,
  shareCommon?: boolean,
  getVersion?: (this: ShareModule, hostModule: any, selfModule: any, modules: Record<string, any>) => string
};

type ExternalItem = {
  id: string|number,
  name: string,
  var: string,
  path: string
}

type SourcemapCallback = (
  scopeName: string,
  host: string,
  publicPath: string,
  href: string,
  source: string,
)=> string;

type BatchReplaceItem = [string|RegExp, string|((substring: string, ...args: any[]) => string)];

type BeforeSourceOptions = {
  isEval?: boolean,
};
type BeforeSourceCallback = (source: string, type: 'js'|'css', href: string, options?: BeforeSourceOptions) => string;

type ImportRemoteCache = {
  _rs?: Record<string, Promise<any>>,
  _json?: Record<string, Promise<any>>,
  _fetched?: Record<string, Promise<string>>,
} & {
  [key: string]: {
    manifest: null|RemoteManifest,
    result: Promise<any>
  }
}
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
  cacheDB: boolean,
  db: IndexedDBProxy
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
  readonly __remoteModuleWebpack__: RemoteModuleWebpack,

  [key: string]: any
}

type ScopeNameFunction = (url: string, options: RemoteOptions) => string|void;
interface RemoteOptions {
  scopeName?: string|ScopeNameFunction,
  timeout?: number,
  externals?: Record<string, any>,
  globals?: Record<string, any>,
  getManifestCallback?: (manifest: RemoteManifest) => any|Promise<any>,
  onRuntimeChanged?: (newManifest: RemoteManifest, oldManifest: RemoteManifest) => any|Promise<any>,
  afterCreateRuntime?: (webpack_require: any, ctx: RemoteModuleRuntime) => void,
  host?: string,
  sync?: boolean,
  cacheDB?: boolean,
  sourcemapHost?: string|SourcemapCallback,
  beforeSource?: BeforeSourceCallback,
  method?: string,
  windowProxy?: {
    document?: {
      html: HTMLElement,
      body: HTMLElement,
      head: HTMLElement
    }
  },
  isCommonModule?: boolean,
  useEsModuleDefault?: boolean,
  meta?: Record<string, any>
}

type CommonModule = {
  url: string|((this: CommonModule, options: RemoteOptions, manifest: RemoteManifest) => string),
  name?: string|((this: CommonModule, options: RemoteOptions, manifest: RemoteManifest) => string),
  host?: string,
  scoped?: boolean
}

interface RemoteManifest {
  timestamp: number,
  name: string,
  version: number,
  webpackVersion: number,
  mode: 'production'|'development',
  devtool: boolean,
  moduleVersion: string,
  hash: string,
  hot: boolean,
  nodeModulesPath: string,
  entryFile: string,
  entryId: string|number,
  windowObject: string,
  globalObject: string,
  jsonpFunction: string,
  hotUpdateGlobal: string,
  uniqueName: string,
  scopeName: string,
  publicPath: string,
  shareModules: ShareModule[],
  remotes: {
    hasJsMatcher?: (chunkId: string|number) => boolean,
    chunkMapping?: Record<string, (number|string)[]>,
    idToExternalAndNameMapping: Record<string, { p?: Promise<any>|0 }>,
    initCodePerScope: Record<string, ['register'|'init']>,
    initialConsumes: Record<string, string|number>,
    moduleIdToSourceMapping: Record<string, any[]>,
    chunkToModuleMapping: Record<string, string|number>,
    runtimeName: string
  },
  externals: ExternalItem[],
  jsChunks: Record<string|number, string>,
  cssChunks: Record<string|number, string>,
  entrys: {
    css: string[],
    js: string[]
    ids: (string|number)[]
  },
  meta: Record<string, any>,

  globalToScopes?: string[],
  batchReplaces?: BatchReplaceItem[],
  commonModules?: CommonModule[],
  sourcemapHost?: string| SourcemapCallback,
  beforeSource?: (
    source: string,
    type: 'js'|'css',
    href: string,
    options: BeforeSourceOptions,
    utils: {
      versionLt: typeof versionLt,
      satisfy: typeof satisfy,
      batchReplace: typeof batchReplace,
      checkOffset: (source: string, offset: number, match: string, replaceStr: string) => string
    }
  ) => ReturnType<BeforeSourceCallback>,
}

interface EntriesInfo {
  name: string,
  version: string,
  timestamp: number,
  entries: {
    [key: string]: {
      chunks: string[],
      meta: Record<string, any>
    }
  },
  [key: string]: any
}

export {
  ExternalItem,
  ShareModule,
  CommonModule,
  RemoteOptions,
  SourcemapCallback,
  BeforeSourceCallback,
  RemoteManifest,
  EntriesInfo,

  ImportRemoteCache,
  RemoteRuntimeManifest,
  RemoteModuleWebpack,
  RemoteModuleRuntime
}
