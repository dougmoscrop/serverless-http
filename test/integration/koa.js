'use strict';

const Koa = require('koa');

const serverless = require('./serverless-http');

const app = new Koa();

app.use(async function (ctx) {
  ctx.status = 200;
  ctx.body = {
    originalUrl: ctx.req.originalUrl,
    url: ctx.req.url,
    method: ctx.req.method.toLowerCase(),
  };
});

module.exports.handler = serverless(app);
