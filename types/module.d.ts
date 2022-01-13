import { RemoteOptions } from './types';
import { RemoteModuleOptions, FetchOptions } from './fetch';

declare class RemoteModule {

  public host: string
  public pathname: string
  public options: RemoteOptions
  public resolveModuleUrl: RemoteModuleOptions['resolveModuleUrl']

  readonly __import_remote_module_class__: true

  constructor(host: string, options?: RemoteModuleOptions)

  external(name: string, module: any): void

  isRequired(moduleName?: string): Promise<boolean>

  prefetch(prefetchs: string[]): Promise<any[]>

  exist(moduleName?: string, options?: FetchOptions): Promise<null|Record<string, string>>

  requireMeta<T = any>(moduleName?: string, options?: FetchOptions): Promise<T>

  requireMetaSync<T = any>(moduleName?: string, options?: FetchOptions): T

  require<T = any>(moduleName?: string, options?: RemoteOptions): Promise<T>

  requireSync<T = any>(moduleName?: string, options?: RemoteOptions): T

  import<T = any>(moduleName?: string, options?: RemoteOptions): Promise<T>

  importSync<T = any>(moduleName?: string, options?: RemoteOptions): T
}

export default RemoteModule;
