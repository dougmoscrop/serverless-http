import serverlessHttp = require('..');
import Koa = require('koa');

// Simple typescript sanity check
serverlessHttp(() => { });
serverlessHttp(new Koa());
