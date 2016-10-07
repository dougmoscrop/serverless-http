'use strict';

const express = require('express'),
  expect = require('chai').expect,
  serverless = require('../serverless-http');

let app, perform;

beforeEach(function() {
  app = express();
  perform = function(request) {
    const handler = serverless(app);
    return new Promise((resolve, reject) => {
      handler(request, null, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }
});

it('basic middleware should set statusCode and default body', () => {
  app.use(function (req, res) {
    res.status(418).send('I\'m a teapot');
  });

  return perform({
    httpMethod: 'GET',
    path: '/'
  })
  .then(response => {
    expect(response.statusCode).to.equal(418);
    expect(response.body).to.equal('I\'m a teapot')
  });
});
