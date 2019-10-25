'use strict';

const getStream = require('get-stream');
const onHeaders = require('on-headers');
const onFinished = require('on-finished');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect } = chai;

const serverless = require('../serverless-http');

describe('spec', () => {
  it('should throw when a non express/koa style object is passed', () => {
    expect(() => serverless({})).to.throw(Error);
  });

  it('should set a default event', async () => {
    let request;

    const handler = serverless((req, res) => {
      request = req;
      res.end('');
    });

    await expect(handler(null)).to.be.fulfilled;
    expect(request).to.be.an('Object');
  });

  it('should trigger on-headers for res', async () => {
    let called = false;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = true;
      });
      res.end('');
    });

    await expect(handler(null)).to.be.fulfilled;
    expect(called).to.be.true;
  });

  it('should trigger on-finished for res', async () => {
    return new Promise(resolve => {
      const handler = serverless((req, res) => {
        onFinished(res, () => {
          resolve();
        });
        res.end('');
      });

      handler(null);
    });
  });

  it('should trigger on-finished for req', async () => {
    let called = false;
    const handler = serverless((req, res) => {
      onFinished(req, () => {
        called = true;
        res.end('');
      });
    });

    await expect(handler(null)).to.be.fulfilled;
    expect(called).to.be.true;
  });

  it('should set default requestId', async () => {
    let called;

    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    });

    await handler({ requestContext: { requestId: 'foo' } });
    expect(!!called).to.be.true;
    expect(called.headers['x-request-id']).to.eql('foo');
  });

  it('should set custom requestId', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: 'Custom-Request-ID' });

    await handler({ requestContext: { requestId: 'bar' } });
    expect(!!called).to.be.true;
    expect(called.headers['custom-request-id']).to.eql('bar');
  });

  it('should use requestPath when available', async () => {
    let url;
    const handler = serverless((req, res) => {
      url = req.url;
      res.end('');
    });

    await handler({ requestPath: '/different', requestContext: { requestId: 'bar' } });
    expect(url).to.deep.equal('/different');
  });

  it('should keep existing requestId', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: 'Custom-Request-ID' });

    await handler({ headers: { 'custom-request-id': 'abc' }, requestContext: { requestId: 'bar' } });
    expect(!!called).to.be.true;
    expect(called.headers['custom-request-id']).to.eql('abc');
  });

  it('should not set request id when disabled', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: false });

    await handler({ requestContext: { requestId: 'bar' } });
    expect(!!called).to.be.true;
    expect(called.headers['x-request-id']).to.be.undefined;
  });

  it('should set request context on request', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    });
    const requestContext = {};
    await handler({ requestContext });
    expect(!!called).to.be.true;
    expect(called.requestContext).to.equal(requestContext);
  });

  it('should set path params', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    });
    const requestContext = {};
    const pathParameters = { hello: 'world' };
    await handler({ requestContext, pathParameters });
    expect(!!called).to.be.true
    expect(called.params).to.equal(pathParameters)
  })

  it('should support transforming the request', async () => {
    let request;
    const event = {}
    const context = {}

    const handler = serverless((req, res) => {
      request = req;
      res.end('');
    }, {
        request: (req, evt, ctx) => {
          req.event = evt;
          req.context = ctx;
        }
      });

    await handler(event, context);
    expect(request.event).to.equal(event);
    expect(request.context).to.equal(context);
  });

  it('should support transforming the response', async () => {
    const handler = serverless((req, res) => {
      res.end('');
    }, {
        response: (res) => {
          res.statusCode = 201;
          res.headers['foo'] = 'bar';
          res.setHeader('bar', 'baz');
        }
      });

    const obj = await handler({});
    expect(obj.statusCode).to.equal(201);
    expect(obj.headers).to.have.property('foo', 'bar');
    expect(obj.headers).to.have.property('bar', 'baz');
  });

  it('should handle unicode when inferring content-length', async () => {
    const body = `{"foo":"অ"}`;

    let length;

    const handler = serverless((req, res) => {
      length = req.headers['content-length'];
      res.end('');
    });

    await handler({ body });
    expect(length).to.equal(13);
  });

  it('should throw if event.body is a number', async () => {
    const body = 42;

    const handler = serverless((req, res) => {
      res.end('');
    });

    await expect(handler({ body }))
      .to.be.rejectedWith(Error, 'Unexpected event.body type: number');
  });

  it('should stringify if event.body is an object', async () => {
    const body = { foo: 'bar' };
    const expected = Buffer.from(JSON.stringify(body));
    let actual;
    const handler = serverless((req, res) => {
      actual = req.body;
      res.end('');
    });

    await handler({ body });
    expect(actual).to.deep.equal(expected);
  });

  it('should accept a Buffer body', async () => {
    const body = Buffer.from('hello world');

    const handler = serverless((req, res) => {
      getStream(req).then(str => {
        res.end(str);
      });
    });

    const res = await handler({ body });
    expect(res)
      .to.be.an('Object')
      .with.a.property('body', 'hello world');
  });

  it('should stringify an Object body if content-type is json', async () => {
    const body = { foo: 'bar' };
    const headers = { 'content-type': 'application/json' };

    const handler = serverless((req, res) => {
      getStream(req).then(str => {
        res.end(str);
      });
    });

    const res = await handler({ body, headers });
    expect(res)
      .to.be.an('Object')
      .with.a.property('body', '{"foo":"bar"}');
  });

  it('should support returning a promise that rejects and not need a callback', async () => {
    const handler = serverless(() => {
      throw new Error('test');
    });

    await expect(handler({})).to.be.rejectedWith('test');
  });

});
