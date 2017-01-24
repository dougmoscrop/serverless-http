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

    handler(null, { awsRequestId: 'foo' }, () => {
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

    handler(null, { awsRequestId: 'bar' }, () => {
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

    handler({ headers: { 'custom-request-id': 'abc' } }, { awsRequestId: 'bar' }, () => {
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

    handler(null, { awsRequestId: 'bar' }, () => {
      expect(called).to.be.truthy;
      expect(called.headers['x-request-id']).to.be.undefined;
      done();
    });
  });
});
