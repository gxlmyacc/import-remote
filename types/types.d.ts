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
  webpackChunk?: boolean
)=> string;

type BatchReplaceItem = [string|RegExp, string|((substring: string, ...args: any[]) => string)];

type BeforeSourceCallback = (source: string, type: 'js'|'css', href: string, options?: { isEval: boolean }) => string;


interface RemoteOptions {
  timeout?: number,
  externals?: Record<string, any>,
  globals?: Record<string, any>,
  getManifestCallback?: (manifest: RemoteManifest) => any|Promise<any>,
  onRuntimeChanged?: (newManifest: RemoteManifest, oldManifest: RemoteManifest) => any|Promise<any>,
  host?: string,
  sync?: boolean,
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
  host?: string,
  name?: string|true,
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
}

export {
  ExternalItem,
  ShareModule,
  CommonModule,
  RemoteOptions,
  SourcemapCallback,
  BeforeSourceCallback,
  RemoteManifest
}
