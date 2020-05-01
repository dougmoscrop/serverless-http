'use strict';

const restify = require('restify'),
  expect = require('chai').expect,
  request = require('./util/request'),
  bodyParser = restify.plugins.bodyParser(),
  queryParser = restify.plugins.queryParser();

describe('restify', () => {
  let app;

  beforeEach(function() {
    app = restify.createServer();
  });

  it('basic middleware should set statusCode and default body', () => {
    app.get('/', function (req, res, next) {
      res.send(418, `I'm a teapot`);
      next();
    });

    return request(app, {
      httpMethod: 'GET'
    })
    .then(response => {
      expect(response.statusCode).to.equal(418);
      expect(response.body).to.equal(`"I'm a teapot"`);
    });
  });

  it('basic middleware should get form body', () => {
    app.use(bodyParser);
    app.post('/', function (req, res, next) {
      res.send(200, req.body.hello);
      next();
    });

    return request(app, {
      httpMethod: 'POST',
      body: 'hello=world',
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '11'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('world');
    });
  });

  it('basic middleware should get json body', () => {
    app.use(bodyParser);
    app.post('/', function (req, res, next) {
      res.send(200, req.body.hello);
      next();
    });

    return request(app, {
      httpMethod: 'POST',
      body: JSON.stringify({
        hello: 'world'
      }),
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('world');
    });
  });

  it('basic middleware should get query params', () => {
    app.use(queryParser);
    app.get('/', function (req, res, next) {
      res.send(200, req.query.foo);
      next();
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/',
      queryStringParameters: {
        foo: 'bar'
      },
      headers: {
        'Accept': 'text/plain'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('bar');
    });
  });

  it('should match verbs', () => {
    app.get('/', function(req, res, next) {
      res.send(200, 'foo');
      next();
    });
    app.put('/', function(req, res, next) {
      res.send(201, 'bar');
      next();
    });

    return request(app, {
      httpMethod: 'PUT',
      headers: {
        'Accept': 'text/plain'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(201);
      expect(response.body).to.equal('bar');
    });
  });

  it('should serve files', () => {
    app.get('/*', restify.plugins.serveStaticFiles('./test'));

    return request(app, {
      httpMethod: 'GET',
      path: '/file.txt',
      headers: {
        'Accept': 'text/plain'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('this is a test\n');
    });
  });

  it('address() returns a stubbed object', () => {
    app.get('/', (req, res, next) => {
      res.send(200, req.connection.address());
      next();
    });

    return request(app, {
      httpMethod: 'GET'
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal(JSON.stringify({ port: 443 }));
    });
  });
});
