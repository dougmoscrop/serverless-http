'use strict';

const restana = require('restana'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  expect = require('chai').expect,
  url = require('url'),
  request = require('./util/request');

describe('restana', () => {
  let app;

  beforeEach(function() {
    app = restana();
  });

  it('basic middleware should set statusCode and default body', () => {
    app.use(function (req, res) {
      res.send(`I'm a teapot`, 418);
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
      res.send(req.body);
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
      res.send(req.body.hello);
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
      const {query} = url.parse(req.url, true)
      res.send(query.foo);
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
      res.send('foo');
    });
    app.put('/', function(req, res) {
      res.send('bar', 201);
    });

    return request(app, {
      httpMethod: 'PUT'
    })
    .then(response => {
      expect(response.statusCode).to.equal(201);
      expect(response.body).to.equal('bar');
    });
  });

  describe('morgan', () => {
    it('combined', () => {
      app.use(morgan('combined'));
      app.use((req, res) => {
        res.send('hello, morgan');
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
        res.send('hello, morgan');
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
      res.send(req.connection.address());
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
      res.send(req.originalUrl);
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
      expect(response.body).to.equal('/foo/bar');
    });
  });
});
