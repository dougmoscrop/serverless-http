'use strict';
const http = require('http')
const Fastify = require('fastify'),
  expect = require('chai').expect,
  request = require('./util/request');

describe('fastify', () => {
  let app;
  let handle;

  const serverFactory = (handler, opts) => {
    handle = handler;
    return http.createServer(handler);
  };

  beforeEach(function() {
    app = Fastify({ serverFactory });
    app.handle = handle;
  });

  it('basic hello world', () => {
    app.get('/', (req, res) => {
      res.send('hello world');
    })

    app.ready();

    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(res => {
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal('hello world');
    });
  });
});
