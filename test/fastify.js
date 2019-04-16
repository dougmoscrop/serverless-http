'use strict';
const fastify = require('fastify'),
  expect = require('chai').expect,
  request = require('./util/request');

describe('fastify', () => {
  let app;

  beforeEach(function() {
    app = fastify();
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
