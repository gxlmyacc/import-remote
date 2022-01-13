

declare function jsonp(url: string, options: {
  key?: string,
  timeout?: number
}): Promise<any>;

export default jsonp;
