import { FetchOptions } from './fetch';

declare function importJson<T = any>(url: string, options: FetchOptions): Promise<T>;

export default importJson;
