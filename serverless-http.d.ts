/// <reference types="aws-lambda" />

declare namespace ServerlessHttp {
    type FrameworkApplication = {
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
        event: any,
        context: AWSLambda.Context,
        callback?: AWSLambda.Callback
    ) => void;
}

declare function serverlessHttp(
    app: ServerlessHttp.HandlerCompatibleApp,
    opts?: any
): ServerlessHttp.LambdaPartial;

export default serverlessHttp;
