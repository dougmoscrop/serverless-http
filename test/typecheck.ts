import * as Koa from "koa"
import * as serverlessHttp from ".."

// Basic definitions check.
const handlerWithFn: serverlessHttp.Handler = serverlessHttp(() => { }) as serverlessHttp.Handler;
const handlerWithApp: serverlessHttp.Handler = serverlessHttp(new Koa()) as serverlessHttp.Handler;

// Options
const handlerWithDefaultOptions: serverlessHttp.Handler = serverlessHttp(new Koa(), {
}) as serverlessHttp.Handler;

// Options
const handlerWithRequestId: serverlessHttp.Handler = serverlessHttp(new Koa(), {
  requestId: 'x-my-req-id'
}) as serverlessHttp.Handler;

