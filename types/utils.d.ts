import {
  isAbsoluteUrl,
  joinUrl
} from './fetch';
import { RemoteImportOptions } from './importJs';

declare const DEFAULT_TIMEOUT: string;
declare const ATTR_SCOPE_NAME: string;

declare function innumerable<T>(
  obj: T,
  key: PropertyKey,
  value: any,
  options?: Omit<PropertyDescriptor, 'value'>
): T;


declare function requireFromStr(source: string, options?: { global?: any, url?: string, moduleProps?: Record<string, any>}): any;
declare function hasOwnProp(obj: any, v: PropertyKey): boolean;
declare function isPlainObject(obj: any): obj is Record<string, any>;
declare function isFunction(fn: any): fn is Function;
declare function isRegExp(obj: any): obj is RegExp;
declare function isSameHost(host1: string, host2: string): boolean;
declare function isEvalDevtool(devtool: boolean|string): boolean;

declare function mergeObject(target: Partial<any>, ...args: Partial<any>[]): Partial<any>;
declare function requireWithVersion<T>(module: T, version: string): T;
declare function getHostFromUrl(url: string): string;

declare function objectDefineProperty<T>(o: T, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>): T;

declare function getCacheUrl(url: string, scopeName: string): string;

declare function transformSourcemapUrl(href: string, source: string, options?: RemoteImportOptions): string;
declare function resolveRelativeUrl(
  url: string,
  options?: {
    host?: string,
    onHost?: (host: string) => string,
  }
): string;


declare function walkMainifest<T>(target: T): T;


declare function copyOwnProperty(target: any, key: string, source: any): PropertyDescriptor | undefined;
declare function copyOwnProperties<T>(target: T, source: any, overwrite?: boolean): T;

export {
  DEFAULT_TIMEOUT,
  ATTR_SCOPE_NAME,

  requireFromStr,
  getCacheUrl,
  innumerable,
  hasOwnProp,
  isSameHost,
  isAbsoluteUrl,
  joinUrl,
  isFunction,
  isPlainObject,
  isRegExp,
  mergeObject,
  getHostFromUrl,
  isEvalDevtool,
  requireWithVersion,
  resolveRelativeUrl,
  walkMainifest,

  transformSourcemapUrl,
  objectDefineProperty,

  copyOwnProperty,
  copyOwnProperties
};
