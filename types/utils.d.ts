import {
  isAbsoluteUrl,
  joinUrl,
} from './fetch';

declare const DEFAULT_TIMEOUT: string;
declare const ATTR_SCOPE_NAME: string;

declare function innumerable<T>(
  obj: T,
  key: PropertyKey,
  value: any,
  options?: Omit<PropertyDescriptor, 'value'>
): T;


declare function hasOwnProp(obj: any, v: PropertyKey): boolean;
declare function isPlainObject(obj: any): boolean;
declare function isFunction(obj: any): boolean;
declare function isRegExp(obj: any): boolean;
declare function isSameHost(host1: string, host2: string): boolean;
declare function isEvalDevtool(devtool: boolean|string): boolean;

declare function mergeObject(target: Partial<any>, ...args: Partial<any>[]): Partial<any>;
declare function requireWithVersion<T>(module: T, version: string): T;
declare function getHostFromUrl(url: string): string;

declare function objectDefineProperty<T>(o: T, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>): T;

declare function getCacheUrl(url: string, scopeName: string): string;

export {
  DEFAULT_TIMEOUT,
  ATTR_SCOPE_NAME,

  getCacheUrl,
  innumerable,
  hasOwnProp,
  isSameHost,
  isAbsoluteUrl,
  joinUrl,
  isFunction,
  isPlainObject,
  isRegExp,
  isEvalDevtool,
  mergeObject,
  getHostFromUrl,
  requireWithVersion,
  objectDefineProperty
}
