const serverless = require('../serverless-http'),
  expect = require('chai').expect;

it('should throw when a non express/koa style object is passed', () => {
  expect(() => serverless({})).to.throw(Error);
});
