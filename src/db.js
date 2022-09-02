import IndexedDBAsync, { isSupportIndexedDB } from 'indexed-db-async';
import { globalModule, TABLE_NAME } from './fetch';

function getLastMonthTime() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return now.getTime();
}

if (!globalModule.db && isSupportIndexedDB()) {
  globalModule.cacheDB = false;
  let db = globalModule.db = new IndexedDBAsync(
    'import-remote-global-db',
    1,
    [
      {
        name: TABLE_NAME,
        key: 'url',
        indexes: [{ name: 'timestamp' }]
      }
    ],
  );
  // delete last month cache
  db.deleteRange(TABLE_NAME, `timestamp > ${getLastMonthTime()}`);
}

function enableCacheDB(enable = true) {
  globalModule.cacheDB = enable;
}

export {
  enableCacheDB
};

export default globalModule.db;
