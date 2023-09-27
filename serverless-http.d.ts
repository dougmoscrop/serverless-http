declare namespace ServerlessHttp {
  export interface FrameworkApplication {
    callback: Function;
    handle: Function;
    router: {
      route: Function;
    }
    _core: {
      _dispatch: Function;
    }
  }

  /**
   * Handler-compatible function or application.
   */
  export type Application = Function | Partial<FrameworkApplication>;
  export type Result = Function | Partial<FrameworkApplication>;

  export type Options = {
    provider?: 'aws' | 'azure' | 'bunAws',
    requestId?: string,
    request?: Object | Function,
    response?: Object | Function,
    binary?: boolean | Function | string | string[],
    basePath?: string
  }
  /**
   * AWS Lambda APIGatewayProxyHandler-like handler.
   */
  export type Handler = (
    event: Object,
    context: Object
  ) => Promise<Object>;
}

/**
 * Wraps the application into a Lambda APIGatewayProxyHandler-like handler.
 */
declare function ServerlessHttp(application: ServerlessHttp.Application, options?: ServerlessHttp.Options): ServerlessHttp.Handler;

export = ServerlessHttp;
