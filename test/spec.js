'use strict';

const onHeaders = require('on-headers');
const onFinished = require('on-finished');
const getStream = require('get-stream');

const serverless = require('../serverless-http'),
  expect = require('chai').expect;

describe('spec', () => {
  it('should throw when a non express/koa style object is passed', () => {
    expect(() => serverless({})).to.throw(Error);
  });

  it('should set a default event', (done) => {
    let request;

    const handler = serverless((req, res) => {
      request = req;
      res.end('');
    });

    handler(null, {}, (err) => {
      expect(err).to.equal(null);
      expect(request.method).to.equal('GET');
      expect(request.url).to.equal('/');
      done();
    });

  });

  it('should trigger on-headers for res', (done) => {
    let called = false;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = true;
      });
      res.end('');
    });

    handler(null, {}, () => {
      expect(called).to.be.true;
      done();
    });
  });

  it('should trigger on-finished for res', (done) => {
    let called = false;
    const handler = serverless((req, res) => {
      onFinished(res, () => {
        called = true;
      });
      res.end('');
    });

    handler(null, {}, () => {
      expect(called).to.be.true;
      done();
    });
  });

  it('should trigger on-finished for req', (done) => {
    let called = false;
    const handler = serverless((req, res) => {
      onFinished(req, () => {
        called = true;
        res.end('');
      });
    });

    handler(null, {}, () => {
      expect(called).to.be.true;
      done();
    });
  });

  it('should set default requestId', (done) => {
    let called;

    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    });

    handler({ requestContext: { requestId: 'foo' } }, {}, () => {
      expect(!!called).to.be.true;
      expect(called.headers['x-request-id']).to.eql('foo');
      done();
    });
  });

  it('should set custom requestId', (done) => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: 'Custom-Request-ID' });

    handler({ requestContext: { requestId: 'bar' } }, {}, () => {
      expect(!!called).to.be.true;
      expect(called.headers['custom-request-id']).to.eql('bar');
      done();
    });
  });

  it('should keep existing requestId', (done) => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: 'Custom-Request-ID' });

    handler({ headers: { 'custom-request-id': 'abc' }, requestContext: { requestId: 'bar' } }, {}, () => {
      expect(!!called).to.be.true;
      expect(called.headers['custom-request-id']).to.eql('abc');
      done();
    });
  });

  it('should not set request id when disabled', (done) => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: false });

    handler({ requestContext: { requestId: 'bar' } }, {}, () => {
      expect(!!called).to.be.true;
      expect(called.headers['x-request-id']).to.be.undefined;
      done();
    });
  });

  it('should support transforming the request', (done) => {
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

    handler(event, context, (err) => {
      expect(err).to.equal(null);
      expect(request.event).to.equal(event);
      expect(request.context).to.equal(context);
      done();
    });
  });

  it('should support transforming the response', (done) => {
    const event = {}
    const context = {}

    const handler = serverless((req, res) => {
      res.end('');
    }, {
      response: (res) => {
        res.statusCode = 201;
        res.headers['foo'] = 'bar';
        res.setHeader('bar', 'baz');
      }
    });

    handler(event, context, (err, obj) => {
      expect(err).to.equal(null);
      expect(obj.statusCode).to.equal(201);
      expect(obj.headers).to.have.property('foo', 'bar');
      expect(obj.headers).to.have.property('bar', 'baz');
      done();
    });
  });

  it('should handle unicode when inferring content-length', (done) => {
    const body = `{"foo":"অ"}`;

    let length;

    const handler = serverless((req, res) => {
      length = req.headers['content-length'];
      res.end('');
    });

    handler({ body }, context, (err) => {
      expect(err).to.equal(null);
      expect(length).to.equal(13);
      done();
    });
  });

  it('should throw if event.body is a number', (done) => {
    const body = 42;

    const handler = serverless((req, res) => {
      res.end('');
    });

    handler({ body }, context, (err) => {
      expect(err).to.be.an('Error')
        .with.a.property('message', 'Unexpected event.body type: number');
      done();
    });
  });

  it('should throw if event.body is an object but content-type is not json', (done) => {
    const body = { foo: 'bar' };

    const handler = serverless((req, res) => {
      res.end('');
    });

    handler({ body }, context, (err) => {
      expect(err).to.be.an('Error')
        .with.a.property('message', 'event.body was an object but content-type is not json');
      done();
    });
  });

  it('should accept a Buffer body', (done) => {
    const body = Buffer.from('hello world');

    const handler = serverless((req, res) => {
      getStream(req).then(str => {
        res.end(str);
      });
    });

    handler({ body }, context, (err, res) => {
      expect(res).to.be.an('Object')
        .with.a.property('body', 'hello world');
      done();
    });
  });

  it('should stringify an Object body if content-type is json', (done) => {
    const body = {foo:'bar'};
    const headers = { 'content-type': 'application/json' };

    const handler = serverless((req, res) => {
      getStream(req).then(str => {
        res.end(str);
      });
    });

    handler({ body, headers }, context, (err, res) => {
      expect(res).to.be.an('Object')
        .with.a.property('body', '{"foo":"bar"}');
      done();
    });
  });

  it('should support returning a promise and not need a callback', () => {
    const event = {}
    const context = {}

    const handler = serverless((req, res) => {
      res.end('');
    });

    return handler(event, context)
      .then(res => {
        expect(res).to.have.property('statusCode', 200);
      });
  });

  it('should support returning a promise that rejects and not need a callback', () => {
    const event = {}
    const context = {}

    const handler = serverless(() => {
      throw new Error('test');
    });

    return handler(event, context)
      .then(() => {
        throw new Error('Should not reach here');
      })
      .catch(err => {
        expect(err).to.have.property('message', 'test');
      });
  });

  it('should not return anything when given a callback', () => {
    const event = {}
    const context = {}

    const handler = serverless((req, res) => {
      res.end('test');
    });

    const r = handler(event, context, (err) => {
      expect(err).to.be.null;
      expect(r).to.be.undefined;
    });
  });

});
