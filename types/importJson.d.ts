import { FetchOptions } from './fetch';

declare function importJson<T = any>(href: string, options: FetchOptions = {}): Promise<T>;

export default importJson;
