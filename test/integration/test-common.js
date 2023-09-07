const { expect } = require('chai');
const supertest = require('supertest');
const path = require('path');
const fs = require('fs');

exports.runtimes = [
  'nodejs12.x',
  // 'nodejs14.x',
];


exports.shouldBehaveLikeIntegration = function() {  
  before(function() {
    this.getEndpoint = (path) => {
      return this.endpoints.find(e => e.pathname === path);
    };
  });
  
  describe('koa', function() {
    it('get', function()  {
      const endpoint = this.getEndpoint('/dev/koa');

      return supertest(endpoint.origin)
        .get(endpoint.pathname)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body.url).to.equal('/koa');
          expect(response.body.method).to.equal('get');
        });
    });
  });

  describe('express', function()  {

    ['get', 'put', 'post'].forEach(method => {
      it(method, function()  {
        const endpoint = this.getEndpoint('/dev/express');

        return supertest(endpoint.origin)[method](endpoint.pathname)
          .expect(200)
          .expect('Content-Type', /json/)
          .then(response => {
            expect(response.body.originalUrl).to.equal('/express');
            expect(response.body.url).to.equal('/express');
            expect(response.body.method).to.equal(method);
          });
      });
    });

    it('get-with-path', function()  {
      const endpoint = this.getEndpoint('/dev/express');

      return supertest(endpoint.origin)
        .get(`${endpoint.pathname}/pathed/1`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body.originalUrl).to.equal('/express/pathed/1');
          expect(response.body.url).to.equal('/express/pathed/1');
          expect(response.body.method).to.equal('get');
          expect(response.body.id).to.equal('1');
        });
    });

  });

  it('binary', function()  {
    const endpoint = this.getEndpoint('/dev/binary');

    const imagePath = path.join(__dirname, 'image.png');
    const expected = fs.readFileSync(imagePath);

    return supertest(endpoint.origin)
      .get(endpoint.pathname)
      .set('Accept', 'image/png') // if this is image/*, APIg will not match :(
      .expect(200)
      .expect('Content-Type', /png/)
      .then(response => {
        if (Buffer.isBuffer(response.body)) {
          if (response.body.equals(expected)) {
            return;
          }
        }

        throw new Error('Binary response body was not a buffer or not equal to the expected image');
      });
  });

  it('timer', function()  {
    const endpoint = this.getEndpoint('/dev/timer');

    return supertest(endpoint.origin)
      .get(endpoint.pathname)
      .expect(200)
      .expect('Content-Type', /json/);
  });

  // FIXME: Broken currently https://github.com/dougmoscrop/serverless-http/issues/270
  it.skip('root', function()  {
    const endpoint = this.getEndpoint('/dev');

    return supertest(endpoint.origin)
      .get(endpoint.pathname)
      .expect(200)
      .expect('Content-Type', /json/);
  });
};