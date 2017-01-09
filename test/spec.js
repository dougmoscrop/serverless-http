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
});
