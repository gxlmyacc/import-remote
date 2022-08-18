const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

/**
 * @type {new (
 *   name: string,
 *   tableMetas?: import('../types/db').IndexedDBProxyTableMetas
 *   version?: number
 * ) => import('../types/db').IndexedDBProxy}
 */
class IndexedDBProxy {

  constructor(name, tableMetas = [], version = 1) {
    if (!indexedDB) {
      throw new Error('not support indexedDB!');
    }
    this.name = name;
    this.version = version;
    this.tableMetas = tableMetas;
    this.tables = this.tableMetas.filter(meta => !meta.delete);
  }

  get db() {
    return new Promise((resolve, reject) => {
      if (this._db) {
        return this._db instanceof Error ? reject(this._db) : resolve(this._db);
      }

      const req = indexedDB.open(this.name, this.version);
      req.onupgradeneeded = event => {
        let db = this._db = event.target.result;

        // delete not defined tables
        let tableCount = db.objectStoreNames.length;
        let deleteTables = [];
        for (let i = 0; i < tableCount; i++) {
          let tableName = db.objectStoreNames[i];
          if (this.tables.some(v => v.name === tableName)) continue;
          deleteTables.push(tableName);
        }
        deleteTables.forEach(tableName => db.deleteObjectStore(tableName));

        // create tables/indexes
        this.tableMetas.forEach(table => {
          let tableStore;
          let transaction;
          if (db.objectStoreNames.contains(table.name)) {
            transaction = db.transaction([table.name], 'readwrite');
            tableStore = transaction.objectStore(table.name);
          }
          if (!tableStore) {
            tableStore = db.createObjectStore(table.name, { keyPath: table.key, autoIncrement: table.autoIncrement });
          }

          // create index
          if (table.indexes) {
            let indexCount = tableStore.indexNames.length;
            let deleteIndexes = [];
            for (let i = 0; i < indexCount; i++) {
              let indexName = tableStore.indexNames[i];
              let newIndex = table.indexes.find(v => v.name === indexName);
              if (newIndex) {
                const oldIndex = tableStore.index(indexName);
                if (oldIndex.unique === Boolean(newIndex.unique)) continue;
              }
              deleteIndexes.push(indexName);
            }
            deleteIndexes.forEach(indexName => tableStore.deleteIndex(indexName));

            table.indexes.forEach(index => {
              let name = index.name;
              if (tableStore.indexNames.contains(name)) return;
              tableStore.createIndex(name, index.key || name, { unique: index.unique });
            });
          }
          if (transaction) transaction.commit();
        });
      };
      req.onsuccess = function (event) {
        this._db = event.target.result;
        resolve(this._db);
      };
      req.onerror = function (event) {
        this._db = new Error('create indexedDB failed ' + event.target.errorCode + '.');
        reject(this._db);
      };
    });
  }

  put(tableName, ...values) {
    return new Promise((resolve, reject) => {
      this.db.then(db => {
        let transaction = db.transaction([tableName], 'readwrite');
        transaction.oncomplete = () => resolve(values);
        transaction.onerror = () => reject(new Error('transaction failed'));

        let table = transaction.objectStore(tableName);
        values.forEach(value => table.put(value));
        transaction.commit();
      }).catch(reject);
    });
  }

  get(tableName, keyPath) {
    return new Promise((resolve, reject) => {
      this.db.then(db => {
        let result = Array.isArray(keyPath) ? [] : undefined;
        let transaction = db.transaction([tableName], 'readonly');
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(new Error('transaction failed'));

        if (!Array.isArray(keyPath)) keyPath = [keyPath];

        let table = transaction.objectStore(tableName);
        keyPath.forEach((keyPath, i) => {
          let req = table.get(keyPath);
          req.onsuccess  = event => {
            if (Array.isArray(result)) result[i] = req.result;
            else result = req.result;
          };
        });
        transaction.commit();
      }).catch(reject);
    });
  }

  count(tableName) {
    return new Promise((resolve, reject) => {
      this.db.then(db => {
        let result = 0;
        let transaction = db.transaction([tableName], 'readonly');
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(new Error('transaction failed'));

        let table = transaction.objectStore(tableName);
        const req = table.count();
        req.onsuccess = () => result = req.result;

        transaction.commit();
      }).catch(reject);
    });
  }

  clear(tableName) {
    return new Promise((resolve, reject) => {
      this.db.then(db => {
        let result = this.count(tableName);
        let transaction = db.transaction([tableName], 'readwrite');
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(new Error('transaction failed'));

        let table = transaction.objectStore(tableName);
        table.clear();

        transaction.commit();
      }).catch(reject);
    });
  }

  delete(tableName, keyPath, indexName, limit) {
    return new Promise((resolve, reject) => {
      this.db.then(db => {
        let result = 0;
        let transaction = db.transaction([tableName], 'readwrite');
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(new Error('transaction failed'));

        let table = transaction.objectStore(tableName);
        if (!Array.isArray(keyPath)) keyPath = [keyPath];
        if (indexName) {
          const index = table.index(indexName);
          keyPath = keyPath.map(keyPath => new Promise((resolve, reject) => {
            const req = index.getAllKeys(keyPath, limit);
            req.onsuccess = () => resolve(req.result);
            req.onerror = event => reject(new Error('index getAllKeys failed ' + event.errorCode + '.'));
          }));
        }
        const _delete = keyPath => {
          const req = table.delete(keyPath);
          req.onsuccess  = () => result++;
          req.onerror = event => reject(new Error('table delete failed ' + event.errorCode + '.'));
        };
        keyPath.forEach(keyPath => {
          if (keyPath.then) {
            keyPath.then(keyPaths =>  keyPaths.forEach(v => _delete(v)));
            return;
          }
          _delete(keyPath);
        });

        transaction.commit();
      }).catch(reject);
    });
  }

}


export default IndexedDBProxy;
