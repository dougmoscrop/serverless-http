import Koa = require("koa");
import serverlessHttp = require("..");

// Basic definitions check.
const handlerWithFn: serverlessHttp.Handler = serverlessHttp(() => { });
const handlerWithApp: serverlessHttp.Handler = serverlessHttp(new Koa());
