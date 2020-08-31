import { version } from '../package.json';
import compose from './compose';
import { Context } from './context';
import { Exception, ExceptionTypes } from './exception';
import {
  fetchMiddleware,
  downloadMiddleware,
  parseFetchMiddleware,
  timeoutMiddleware,
  returnMiddleware,
  exceptionMiddleware,
} from './middleware';
import { RequestOptions, Middleware, Next } from './interfaces';
import { isFunction, mergeOptions } from './utils';

export type { Exception, ExceptionTypes, RequestOptions, Middleware, Context, Next };

type RequestMethod = HttpClient['request'];

const coreMiddlewareStack = [
  exceptionMiddleware,
  returnMiddleware,
  parseFetchMiddleware,
  timeoutMiddleware,
  downloadMiddleware,
  fetchMiddleware,
];

class HttpClient {
  static readonly version = version;
  static readonly Exception = Exception;
  protected static readonly coreMiddlewareStack = coreMiddlewareStack;

  protected readonly middlewareStack: Middleware[];
  protected readonly defaults: RequestOptions;

  get: RequestMethod;
  post: RequestMethod;
  delete: RequestMethod;
  put: RequestMethod;
  patch: RequestMethod;
  head: RequestMethod;
  options: RequestMethod;

  constructor(options?: RequestOptions) {
    this.middlewareStack = [];
    this.defaults = mergeOptions(options);
    const methods = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options'];
    methods.forEach(method => {
      this[method] = (url: string, options?: RequestOptions) => this.request(url, { ...options, method });
    });
  }

  use(middleware: Middleware) {
    if (!isFunction(middleware)) throw new TypeError('middleware must be a function!');
    this.middlewareStack.push(middleware);
    return this;
  }

  request(url: string, options?: RequestOptions): Promise<any> {
    const merged = mergeOptions(this.defaults, options);
    const ctx = new Context(url, merged);
    const stack = [...this.middlewareStack, ...HttpClient.coreMiddlewareStack];
    return compose(stack)(ctx);
  }
}

export default HttpClient;
