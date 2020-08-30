import { RequestOptions } from './interfaces';

const toRawType = (val: unknown) => Object.prototype.toString.call(val).slice(8, -1);

export const isPlainJSON = (val: unknown): val is Record<any, any> | any[] => {
  const type = toRawType(val);
  return ['Object', 'Array'].includes(type);
};

export const isNumber = (val: unknown): val is number => typeof val === 'number';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isFunction = (val: unknown): val is Function => typeof val === 'function';

export const setIfNull = (target: Headers | URLSearchParams, key: string, value: string) => {
  if (!target.has(key)) target.set(key, value);
};

export const mergeOptions = (global: RequestOptions = {}, options: RequestOptions = {}): RequestOptions => {
  const merged = { ...global, ...options };
  merged.headers = mergeHeaders(global.headers, options.headers);
  merged.params = mergeParams(global.params, options.params);

  // Set default options
  merged.method = merged.method?.toUpperCase() ?? 'GET';
  merged.responseType ??= 'json';
  // The default value of `credentials` of some browsers is not `same-origin`
  // e.g. Firefox 39-60, Chrome 42-67, Safari 10.1-11.1.2
  merged.credentials ??= 'same-origin';
  return merged;
};

type RequestHeaders = RequestOptions['headers'];
type RequestParams = RequestOptions['params'];

const mergeHeaders = (val1: RequestHeaders, val2: RequestHeaders) => {
  const source = new Headers(val1);
  const result = new Headers(val2);
  // For options, directly overwrite, and not append
  source.forEach((v, k) => setIfNull(result, k, v));
  return result;
};

const mergeParams = (val1: RequestParams, val2: RequestParams) => {
  const source = new URLSearchParams(val1);
  const result = new URLSearchParams(val2);
  source.forEach((v, k) => setIfNull(result, k, v));
  return result;
};

const ABORT_ERROR_NAME = 'AbortError';
export const isAborted = (val: unknown): val is DOMException =>
  val instanceof DOMException && val.name === ABORT_ERROR_NAME;
