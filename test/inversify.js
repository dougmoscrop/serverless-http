'use strict';

require('reflect-metadata');

const bodyParser = require('body-parser'),
  expect = require('chai').expect,
  request = require('./util/request'),
  { Container } = require('inversify'),
  { InversifyExpressServer } = require('inversify-express-utils');

describe('inversify', () => {
  let app;

  beforeEach(function() {
    const container = new Container();
    const server = new InversifyExpressServer(container, null, null, null, null, false);

    server.setConfig((app) => {
      // add body parser
      app.use(bodyParser.urlencoded({
        extended: true
      }));
      app.use(bodyParser.json());
      app.use((req, res) => {
        res.json({ test: req.body.test });
      });
    });

    app = server.build();
  });

  it('basic request with body', () => {
    return request(app, {
      httpMethod: 'POST',
      path: '/',
      headers: {
        'content-type': 'application/json'
      },
      body: {
        test: 'testing'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('{"test":"testing"}');
    });
  });
});
