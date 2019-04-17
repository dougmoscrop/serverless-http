'use strict';

const Koa = require('koa');

const serverless = require('./serverless-http');

const app = new Koa();

app.use(function* () {
  this.status = 200;
  this.body = {
    url: this.req.url
  };
});

module.exports.handler = serverless(app);
