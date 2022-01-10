export declare function innumerable<T>(
  obj: T,
  key: PropertyKey,
  value: any,
  options?: Omit<PropertyDescriptor, 'value'>
): T;


export declare function mergeObject(target: Partial<any>, ...args: Partial<any>[]): Partial<any>;
export declare function requireWithVersion<T>(module: T, version: string): T;


export declare function objectDefineProperty<T>(o: T, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>): T;

