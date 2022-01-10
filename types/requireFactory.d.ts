import { ExternalItem } from './types';

type RemoteRequireFactoryMap = {
  [key: string]: () => Promise<any>
}

interface RemoteRequireFactory {
  (externals: ExternalItem[]): Promise<Record<string, any>>;
  readonly __import_remote_require_factory__: true,
}

declare function createRequireFactory(
  factory: Omit<RemoteRequireFactory, '__import_remote_require_factory__'>|RemoteRequireFactoryMap
): RemoteRequireFactory;

declare function isRequireFactory(fn: any): boolean;

export {
  isRequireFactory
};

export default createRequireFactory;
