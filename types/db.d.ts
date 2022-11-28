import { globalModule } from './fetch';

declare function enableCacheDB(enable?: boolean): void;

export {
  enableCacheDB
};

export default globalModule.db;
