import Koa = require("koa");
import serverlessHttp = require("..");

// Basic definitions check.
const handlerWithFn: serverlessHttp.Handler = serverlessHttp(() => { }) as serverlessHttp.Handler;
const handlerWithApp: serverlessHttp.Handler = serverlessHttp(new Koa()) as serverlessHttp.Handler;
