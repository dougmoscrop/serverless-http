'use strict';

const koa = require('koa');

const serverless = require('./serverless-http');

const app = koa();

app.use(function* () {
  this.status = 200;
  this.body = 'This is a test';
});

module.exports.handler = serverless(app);
