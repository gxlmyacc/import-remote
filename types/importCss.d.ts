import { RemoteImportOptions } from './importJs';

declare function importCss<T = HTMLStyleElement>(url: string, options?: RemoteImportOptions): Promise<T>;

export default importCss;
