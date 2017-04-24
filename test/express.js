'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  expect = require('chai').expect,
  serverless = require('../serverless-http');

describe('express', () => {
  let app, perform;

  beforeEach(function() {
    app = express();
    perform = function(request) {
      const handler = serverless(app);
      return new Promise((resolve, reject) => {
        handler(request, {}, (err, response) => {
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

  it('basic middleware should get text body', () => {
    app.use(bodyParser.text());
    app.use(function (req, res) {
      res.status(200).send(req.body);
    });

    return perform({
      httpMethod: 'GET',
      path: '/',
      body: 'hello, world',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': '12'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('hello, world')
    });
  });

  it('basic middleware should get json body', () => {
    app.use(bodyParser.json());
    app.use(function (req, res) {
      res.status(200).send(req.body.hello);
    });

    return perform({
      httpMethod: 'GET',
      path: '/',
      body: {
        hello: 'world'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('world');
    });
  });

  it('basic middleware should get query params', () => {
    app.use(function (req, res) {
      res.status(200).send(req.query.foo);
    });

    return perform({
      httpMethod: 'GET',
      path: '/',
      queryStringParameters: {
        foo: 'bar'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('bar')
    });
  });

  it('should match verbs', () => {
    app.get('/', function(req, res) {
      res.status(200).send('foo');
    });
    app.put('/', function(req, res) {
      res.status(201).send('bar');
    });

    return perform({
      httpMethod: 'PUT',
      path: '/',
    })
    .then(response => {
      expect(response.statusCode).to.equal(201);
      expect(response.body).to.equal('bar');
    });
  });

  it('should serve files', () => {
    app.use(express.static('test'));

    return perform({
      httpMethod: 'GET',
      path: '/file.txt',
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('this is a test\n');
    });
  });

  describe('morgan', () => {
    it('combined', () => {
      app.use(morgan('combined'));
      app.use((req, res) => {
        res.status(200).send('hello, morgan');
      });

      return perform({
        httpMethod: 'GET',
        path: '/',
        headers: {
          authorization: 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'
        },
        requestContext: {
          identity: {
            sourceIp: '1.3.3.7'
          }
        }
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('short', () => {
      app.use(morgan('short'));
      app.use((req, res) => {
        res.status(200).send('hello, morgan');
      });

      return perform({
        httpMethod: 'GET',
        path: '/',
        headers: {
          authorization: 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'
        },
        requestContext: {
          identity: {
            sourceIp: '1.3.3.7'
          }
        }
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
