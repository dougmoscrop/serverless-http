'use strict';

const Hapi = require('hapi'),
  expect = require('chai').expect,
  request = require('./util/request');

describe('hapi', () => {
  let app;

  beforeEach(function() {
    app = Hapi.server();
  });

  it('basic hello world', () => {
    app.route({
      method: 'GET',
      path: '/',
      handler: () => 'Hello, world!'
   });

    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('Hello, world!');
    });
  });
});
