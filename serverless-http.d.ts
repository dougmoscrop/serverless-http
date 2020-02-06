/// <reference types="aws-lambda" />
import { Context, HttpRequest } from '@azure/functions';

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

  /**
   * AWS Lambda APIGatewayProxyHandler-like handler.
   */
  export type Handler = (
    event: AWSLambda.APIGatewayProxyEvent,
    context: AWSLambda.Context
  ) => Promise<AWSLambda.APIGatewayProxyResult>;

  export type AzureHandler = (
    context: Context,
    req: HttpRequest
  ) => Promise<{ [key: string]: any }>;
}

/**
 * Wraps the application into a Lambda APIGatewayProxyHandler-like handler.
 */
declare function ServerlessHttp(application: ServerlessHttp.Application, options?: any): ServerlessHttp.Handler | ServerlessHttp.AzureHandler;

export = ServerlessHttp;
