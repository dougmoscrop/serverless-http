'use strict';

/* eslint-disable no-console */

const { URL } = require('url');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process')

const { expect } = require('chai');
const supertest = require('supertest');

function run(cmd) {
   const res = execSync(`npx serverless ${cmd}`)
   return res.toString()
}

function getEndpoints(info) {
  return info.reduce((memo, msg) => {
    if (msg.indexOf('endpoints') !== -1) {
      msg.split('\n').slice(1).map(txt => {
        if (txt) {
          const endpoint = txt.replace('  ANY - ', '');
          const url = new URL(endpoint);
          memo.push(url);
        }
      });
    }
  return memo;
  }, []);
}

const runtimes = [
  'nodejs12.x',
  'nodejs14.x',
];

runtimes.forEach(runtime => {
  describe(runtime, function () {
    this.slow(5000);
    this.timeout(10000);

    let endpoints;

    function getEndpoint(path) {
      return endpoints.find(e => e.pathname === path);
    }

    before(async function() {
      this.timeout(0);
      process.env.RUNTIME = runtime
      await run('deploy');
    });

    before(async function() {
      this.timeout(10000);
      const info = await run('info');
      endpoints = await getEndpoints(info.split('\r?\n'));
    });

    describe('koa', () => {

      it('get', () => {
        const endpoint = getEndpoint('/dev/koa');

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

    describe('express', () => {

      ['get', 'put', 'post'].forEach(method => {
        it(method, () => {
          const endpoint = getEndpoint('/dev/express');

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

      it('get-with-path', () => {
        const endpoint = getEndpoint('/dev/express');

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

    it('binary', () => {
      const endpoint = getEndpoint('/dev/binary');

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

    it('timer', () => {
      const endpoint = getEndpoint('/dev/timer');

      return supertest(endpoint.origin)
        .get(endpoint.pathname)
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('root', () => {
      const endpoint = getEndpoint('/dev');

      return supertest(endpoint.origin)
        .get(endpoint.pathname)
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });

});
