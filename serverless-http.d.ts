/// <reference types="aws-lambda" />

declare namespace ServerlessHttp {
    type FrameworkApplication = {
        callback: Function;
        handle: Function;
        router: {
            route: Function;
        }
        _core: {
            _dispatch: Function;
        }
    }
    type HandlerCompatibleApp = Function | Partial<FrameworkApplication>;
    type LambdaPartial = (
        event: AWSLambda.APIGatewayProxyEvent,
        context: AWSLambda.Context
    ) => AWSLambda.APIGatewayProxyResult;
}

declare function serverlessHttp(
    app: ServerlessHttp.HandlerCompatibleApp,
    opts?: any
): Promise<ServerlessHttp.LambdaPartial>;

export = serverlessHttp;
