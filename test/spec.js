'use strict';

const serverless = require('../serverless-http'),
  expect = require('chai').expect;

describe('serverless-http', () => {

  it('should throw when a non express/koa style object is passed', () => {
    expect(() => serverless({})).to.throw(Error);
  });

  it('should produce a handler for koa-style middleware', () => {
    const handler = serverless({
      callback: function() {
        return Function.prototype;
      }
    });

    expect(handler).to.be.a('Function').with.length(3);
  });

  it('should produce a handler for express-style middleware', () => {
    const handler = serverless({
      handle: Function.prototype
    });

    expect(handler).to.be.a('Function').with.length(3);
  });

  describe('performance', () => {
    let perform;

    beforeEach(function() {
      perform = function() {
        const handler = serverless({
          callback: function() {
            return function(req, res) {
              res.send(200);
            }
          }
        });
        return new Promise((resolve, reject) => {
          handler({}, null, (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          });
        });
      };
    });

    it('can do 10000/sec', function() {
      this.timeout(1000);
      this.slow(1000);

      let runs = [];
      for (let i = 0; i < 10000; i++ ) {
        runs.push(perform({
          httpMethod: 'GET',
          path: '/'
        }));
      }
      return Promise.all(runs)
    });
  });
});
