'use strict';

const Koa = require('koa'),
  route = require('koa-route'),
  compress = require('koa-compress'),
  bodyparser = require('koa-bodyparser'),
  serve = require('koa-static'),
  Router = require('koa-router'),
  expect = require('chai').expect,
  zlib = require('zlib'),
  request = require('./util/request');

describe('koa', () => {
  let app;

  beforeEach(function() {
    app = new Koa();
  });

  it('basic middleware should set statusCode and default body', () => {
    app.use(async (ctx) => {
      ctx.status = 418;
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(418);
      expect(response.body).to.equal('I\'m a teapot')
    });
  });

  it('basic middleware should receive queryString', () => {
    app.use(async (ctx) => {
      ctx.body = ctx.query.x;
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/',
      queryStringParameters: {
        x: 'y'
      }
    })
    .then(response => {
      expect(response.body).to.equal('y');
    });
  });

  it('basic middleware should receive multi-value queryString', () => {
    app.use(async (ctx) => {
      ctx.body = ctx.query.x;
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/',
      queryStringParameters: {
        x: 'y'
      },
      multiValueQueryStringParameters: {
        x: ['z', 'y']
      }
    })
    .then(response => {
      expect(response.body).to.equal('["z","y"]');
    });
  });


  it('basic middleware should set statusCode and custom body', () => {
    app.use(async (ctx) => {
      ctx.status = 201;
      ctx.body = { foo: 'bar' };
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(201);
      expect(response.body).to.equal('{"foo":"bar"}');
    });
  });

  it('basic middleware should set headers', () => {
    app.use(async (ctx) => {
      ctx.body = { "test": "foo" };
      ctx.set('X-Test-Header', 'foo');
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal({
        'content-length': '14',
        'content-type': 'application/json; charset=utf-8',
        'x-test-header': 'foo'
      });
    });
  });

  it('basic middleware should get headers', () => {
    let headers;
    app.use(async (ctx) => {
      headers = ctx.request.headers;
      ctx.status = 204;
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/',
      headers: {
        'X-Request-Id': 'abc'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(204);
      expect(headers['x-request-id']).to.equal('abc');
    });
  });

  it('basic middleware should set string body', () => {
    app.use(async (ctx) => {
      ctx.body = 'Hello World';
    });

    return request(app, {
      httpMethod: 'GET',
      path: '/',
      headers: {
        'X-Request-Id': 'abc'
      }
    })
    .then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('Hello World');
    });
  });

  it('error middleware should set statusCode and default body', () => {
    app.use(async () => {
      throw new Error('hey man, nice shot');
    });
    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(500);
      expect(response.body).to.equal('Internal Server Error')
    });
  });

it('auth middleware should set statusCode 401', () => {
    app.use(async (ctx) => {
      ctx.throw(401, `Unauthorized: ${ctx.request.method} ${ctx.request.url}`);
    });
    return request(app, {
      httpMethod: 'GET',
      path: '/'
    })
    .then(response => {
      expect(response.statusCode).to.equal(401);
    });
  });


  describe('koa-route', () => {

    beforeEach(() => {
      app.use(route.get('/foo', async (ctx) => {
        ctx.body = 'foo';
      }));
      app.use(route.get('/foo/:bar', async (ctx, bar) => {
        ctx.body = bar;
      }));
      app.use(route.post('/foo', async (ctx) => {
        ctx.status = 201;
        ctx.body = 'Thanks';
      }));
    });

    it('should get path information when it matches exactly', () => {
      return request(app, {
        httpMethod: 'GET',
        path: '/foo'
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal('foo')
      });
    });

    it('should get path information when it matches with params', () => {
      return request(app, {
        httpMethod: 'GET',
        path: '/foo/baz'
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal('baz')
      });
    });

    it('should get method information', () => {
      return request(app, {
        httpMethod: 'POST',
        path: '/foo'
      })
      .then(response => {
        expect(response.statusCode).to.equal(201);
        expect(response.body).to.equal('Thanks')
      });
    });

    it('should allow 404s', () => {
      return request(app, {
        httpMethod: 'POST',
        path: '/missing'
      })
      .then(response => {
        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('koa-router', function() {

    beforeEach(() => {
      const router = new Router();

      router.use('/route', async (ctx, next) => {
        if (this.method === 'POST') {
          ctx.status = 404;
        } else {
          await next;
        }
      });

      router.get('/', async (ctx) => {
        ctx.body = await Promise.resolve('hello');
      });

      app.use(router.routes());
      app.use(router.allowedMethods());
    });

    it('should get when it matches', function() {
      return request(app, {
        httpMethod: 'GET',
        path: '/'
      })
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal('hello');
      });
    });

    it('should 404 when route does not match', function() {
      return request(app, {
        httpMethod: 'GET',
        path: '/missing'
      })
      .then((response) => {
        expect(response.statusCode).to.equal(404);
        expect(response.headers).to.deep.equal({
          'content-length': '9',
          'content-type': 'text/plain; charset=utf-8'
        });
      });
    });
  });

  describe('koa-bodyparser', () => {

    beforeEach(() => {
      app.use(bodyparser());
    });

    it('should parse json', () => {
      const body = `{"foo":"bar"}`;

      let actual;
      app.use(async(ctx) => {
        ctx.status = 204;
        ctx.body = {};
        actual = ctx.request.body;
      });
      return request(app, {
        httpMethod: 'GET',
        path: '/',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body.length
        },
        body
      })
      .then(() => {
        expect(actual).to.deep.equal({
          "foo": "bar"
        });
      });
    });

    it('works with gzip (base64 encoded string)', () => {
      let actual;
      app.use(async (ctx) => {
        ctx.status = 204;
        ctx.body = {};
        actual = ctx.request.body;
      });

      return new Promise((resolve) => {
        zlib.gzip(`{"foo":"bar"}`, function (_, result) {
          resolve(result);
        });
      })
      .then((zipped) => {
        return request(app, {
          httpMethod: 'GET',
          path: '/',
          headers: {
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip',
            'Content-Length': zipped.length,
          },
          body: zipped.toString('base64'),
          isBase64Encoded: true
        })
        .then(() => {
          expect(actual).to.deep.equal({
            foo: "bar"
          });
        });
      });
    });

    it('can handle DELETE with no body', () => {
      let called;
      app.use(async (ctx) => {
        ctx.status = 204;
        called = true;
      });
      return request(app, {
        httpMethod: 'DELETE',
        path: '/',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(() => {
        expect(called).to.equal(true);
      });
    });
  });

  describe('koa-static', () => {

    beforeEach(() => {
      app.use(serve(__dirname));
    });

    it('should serve a text file', () => {
      return request(app, {
        httpMethod: 'GET',
        path: 'file.txt'
      })
      .then((response) => {
        expect(response.body).to.equal('this is a test\n');
      });
    });
  });

  describe('koa-compress', () => {

    beforeEach(() => {
      app.use(compress({
        threshold: 1
      }));
      app.use(async (ctx) => {
        ctx.body = 'this is a test';
      });
    });

    it('should serve compressed text (base64 encoded)', () => {
      return request(app, {
        httpMethod: 'GET',
        path: '/',
        headers: {
          'accept-encoding': 'deflate'
        }
      })
      .then((response) => {
        const decoded = Buffer.from(response.body, 'base64');
        const inflated = zlib.inflateSync(decoded);

        expect(inflated.toString()).to.equal('this is a test');
      });
    });
  });
});
