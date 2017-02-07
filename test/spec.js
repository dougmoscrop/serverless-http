'use strict';

const onHeaders = require('on-headers');

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

  it('should set default requestId', (done) => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    });

    handler({ requestContext: { requestId: 'foo' } }, {}, () => {
      expect(called).to.be.truthy;
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
      expect(called).to.be.truthy;
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
      expect(called).to.be.truthy;
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
      expect(called).to.be.truthy;
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
    let response;
    const event = {}
    const context = {}

    const handler = serverless((req, res) => {
      response = res;
      res.end('');
    }, {
      response: (res, evt, ctx) => {
        res.event = evt;
        res.context = ctx;
      }
    });

    handler(event, context, (err) => {
      expect(err).to.equal(null);
      expect(response.event).to.equal(event);
      expect(response.context).to.equal(context);
      done();
    });
  });
});
