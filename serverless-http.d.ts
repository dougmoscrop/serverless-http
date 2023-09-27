import { Server } from "http";

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
   * Handler-compatible function, application or plain http server.
   */
  export type Application = Function | Partial<FrameworkApplication> | Server;
  export type Result = Function | Partial<FrameworkApplication> | Server;

  export type Options = {
    provider?: 'aws' | 'azure'
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
