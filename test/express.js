'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  expect = require('chai').expect,
  request = require('./util/request');

describe('express', () => {
  let app;

  beforeEach(function() {
    app = express();
  });

  it('basic middleware should set statusCode and default body', () => {
    app.use(function (req, res) {
      res.status(418).send(`I'm a teapot`);
    });

    return request(app, {
      httpMethod: 'GET'
    })
    .then(response => {
      expect(response.statusCode).to.equal(418);
      expect(response.body).to.equal(`I'm a teapot`)
    });
  });

  it('basic middleware should get text body', () => {
    app.use(bodyParser.text());
    app.use(function (req, res) {
      res.status(200).send(req.body);
    });

    return request(app, {
      httpMethod: 'GET',
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

    return request(app, {
      httpMethod: 'GET',
      body: JSON.stringify({
        hello: 'world'
      }),
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

    return request(app, {
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

    return request(app, {
      httpMethod: 'PUT'
    })
    .then(response => {
      expect(response.statusCode).to.equal(201);
      expect(response.body).to.equal('bar');
    });
  });

  it('should serve files', () => {
    app.use(express.static('test'));

    return request(app, {
      httpMethod: 'GET',
      path: '/file.txt'
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

      return request(app, {
        httpMethod: 'GET',
        headers: {
          authorization: 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'
        },
        path: '/',
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

      return request(app, {
        httpMethod: 'GET',
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

  it('address() returns a stubbed object', () => {
    app.use(morgan('short'));
    app.use((req, res) => {
      res.status(200).send(req.connection.address());
    });

    return request(app, {
      httpMethod: 'GET'
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal(JSON.stringify({ port: 443 }));
    });
  });

  it('sets originalUrl', () => {
    app.use((req, res) => {
      res.status(200).json({
        url: req.url,
        originalUrl: req.originalUrl
      });
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/bar',
      requestContext: {
        path: '/foo/bar'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal(JSON.stringify({
        url: '/bar',
        originalUrl: '/bar'
      }));
    });
  });

  it('destroy weird', () => {
    app.use((req, res) => {
      // this was causing a .destroy is not a function error
      res.send('test');
      res.json({ test: 'test' });
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/bar',
      requestContext: {
        path: '/foo/bar'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('test');
    });
  })
});
