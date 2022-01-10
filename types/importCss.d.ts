import { RemoteImportOptions } from './importJs';

declare function importCss<T = HTMLStyleElement>(href: string, options?: RemoteImportOptions): Promise<T>;

export default importCss;
