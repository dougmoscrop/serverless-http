'use strict';

const url = require('url'),
  fs = require('fs'),
  expect = require('chai').expect,
  serverless = require('../serverless-http');

describe('generic http listener', () => {
  let app, perform;

  beforeEach(function() {
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

  it('should set statusCode and default body', () => {
    app = function(req, res) {
      res.statusCode = 418;
      res.write('I\'m a teapot');
      res.end();
    };

    return perform({
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

    return perform({
      httpMethod: 'GET',
      path: '/',
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

    return perform({
      httpMethod: 'GET',
      path: '/',
      queryStringParameters: {
        foo: 'bar'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('foo=bar');
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

    return perform({
      httpMethod: 'PUT',
      path: '/',
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

    return perform({
      httpMethod: 'GET',
      path: '/file.txt',
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('this is a test\n');
    });
  });
});
