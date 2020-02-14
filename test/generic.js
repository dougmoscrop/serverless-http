'use strict';

const url = require('url'),
  fs = require('fs'),
  expect = require('chai').expect,
  request = require('./util/request');

describe('generic http listener', () => {
  let app;

  it('should set statusCode and default body', () => {
    app = function(req, res) {
      res.statusCode = 418;
      res.write('I\'m a teapot');
      res.end();
    };

    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(418);
      expect(response.body).to.equal('I\'m a teapot');
    });
  });

  it('should get / set body', () => {
    app = function(req, res) {
      let body = '';

      req.on('data', function(data) {
        body += data;
      });

      req.on('end', function() {
        res.statusCode = 200;
        res.write(body);
        res.end();
      });
    };

    return request(app, {
      httpMethod: 'GET',
      body: 'hello, world'
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('hello, world');
    });
  });

  it('should get query params', () => {
    app = function (req, res) {
      const urlObject = url.parse(req.url);

      res.statusCode = 200;
      res.write(urlObject.query);
      res.end();
    };

    return request(app, {
      httpMethod: 'GET',
      queryStringParameters: {
        foo: 'bar'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('foo=bar');
    });
  });

  it('should get multi-value query params', () => {
    app = function (req, res) {
      const urlObject = url.parse(req.url);

      res.statusCode = 200;
      res.write(urlObject.query);
      res.end();
    };

    return request(app, {
      httpMethod: 'GET',
      queryStringParameters: {
        foo: 'bar'
      },
      multiValueQueryStringParameters: {
        foo: ['qux', 'bar']
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('foo=qux&foo=bar');
    });
  });

  it('should match verbs', () => {
    app = function (req, res) {
      if (req.method === 'PUT') {
        res.statusCode = 200;
        res.write('foo');
        res.end();
      }
    };

    return request(app, {
      httpMethod: 'PUT',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('foo');
    });
  });

  it('should serve files', () => {
    app = function (req, res) {
      const fileStream = fs.createReadStream('test/file.txt');

      res.statusCode = 200;
      fileStream.pipe(res);
    };

    return request(app, {
      httpMethod: 'GET',
      path: '/file.txt'
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('this is a test\n');
    });
  });

  it('should convert array-typed headers to csv and set-cookies workaround with binarycase', function() {
    app = function (req, res) {
      const body = 'setting cookies';

      res.setHeader('Content-Length', body.length);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);
      res.setHeader('Allow', ['GET', 'HEAD']);
      res.statusCode = 200;
      res.end();
    };

    return request(app, {
      httpMethod: 'GET'
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal({
        allow: 'GET, HEAD',
        'Set-cookie': 'bar=baz',
        'content-length': '15',
        'content-type': 'text/plain',
        'set-cookie': 'foo=bar'
      });
    });
  });

  it('should intercept writeHead', () => {
    app = function(req, res) {
      res.writeHead(302, {
        Location: '/redirect',
        Accept: '*/*'
      });
      res.end();
    };

    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(302);
      expect(response.headers).to.deep.equal({
        location: '/redirect',
        accept: '*/*'
      });
    });
  });
});
