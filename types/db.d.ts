
interface IndexedDBProxyTableMetaIndex {
  name: string,
  key?: string,
  unique?: boolean,
}
type IndexedDBProxyTableMetaIndexes = IndexedDBProxyTableMetaIndex[];

interface IndexedDBProxyTableMeta {
  name: string,
  key: string,
  autoIncrement?: boolean;
  indexes?: IndexedDBProxyTableMetaIndex[]
}

type IndexedDBProxyTableMetas = IndexedDBProxyTableMeta[];

type KeyPath = string|IDBKeyRange;

declare class IndexedDBProxy {

  public readonly name: string
  public readonly version: number
  public readonly tableMetas: IndexedDBProxyTableMeta[]
  public readonly tables: IndexedDBProxyTableMeta[]

  public readonly db: Promise<IDBDatabase>

  constructor(name: string, tableMetas?: IndexedDBProxyTableMeta[], version?: number)

  put<T extends Array>(tableName: string, ...values: T): Promise<T>

  get<T extends KeyPath|KeyPath[]>(tableName: string, keyPath: T): Promise<T extends Array ? Array<any> : any>

  count(tableName: string): Promise<number>

  clear(tableName: string): Promise<number>

  delete(tableName: string, keyPath: KeyPath|KeyPath[], indexName?: string, limit?: number): Promise<number>
}

export {
  IndexedDBProxyTableMetaIndex,
  IndexedDBProxyTableMetaIndexes,

  IndexedDBProxyTableMeta,
  IndexedDBProxyTableMetas,

  IndexedDBProxy
}

export default IndexedDBProxy;
