'use strict';

const sails = require('sails'),
  expect = require('chai').expect,
  request = require('./util/request');

describe('sails', () => {
  let app;

  beforeEach(function(done) {
    app = sails.load({
      hooks: {
        session: false
      }
    }, err => {
      done(err);
    });
  });

  it('basic unconfigured should set 404 statusCode and default body', () => {
    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(404);
      expect(response.body).to.equal('Not Found');
    });
  });
});
