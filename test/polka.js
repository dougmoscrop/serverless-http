'use strict';
const polka = require('polka'),
  expect = require('chai').expect,
  request = require('./util/request');

describe('polka', () => {
  let app;

  beforeEach(function() {
    app = polka();
  });

  it('basic hello world', () => {
    app.get('/', (req, res) => {
      res.end('hello world');
    });

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
