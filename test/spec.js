'use strict';

const serverless = require('../serverless-http'),
  expect = require('chai').expect;

it('should throw when a non express/koa style object is passed', () => {
  expect(() => serverless({})).to.throw(Error);
});

it('should set a default event', (done) => {
  let request;

  const handler = serverless((req, res) => {
    request = req;
    res.send(200);
  });

  handler(null, {}, (err) => {
    expect(err).to.equal(null);
    expect(request.body).to.deep.equal({});
    expect(request.method).to.equal('GET');
    expect(request.path).to.equal('/');
    done();
  });

});
