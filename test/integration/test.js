'use strict';

/* eslint-disable no-console */

const { URL } = require('url');
const path = require('path');
const fs = require('fs');

const { expect } = require('chai');
const Serverless = require('serverless');
const intercept = require('intercept-stdout');
const supertest = require('supertest');

function run(cmd) {
  // hack argv so serverless runs a command
  process.argv = process.argv.slice(0, 2).concat(cmd.split(' '));

  const serverless = new Serverless({});

  return serverless.init()
    .then(() => {
      const messages = [];
      const unhook = intercept(text => messages.push(text));

      return serverless.run()
        .then(() => {
          unhook();
          return messages;
        });
    });
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
  'nodejs8.10',
  'nodejs10.x'
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
      await run(`deploy --runtime=${runtime}`);
    });

    before(async function() {
      this.timeout(10000);
      const info = await run('info');
      endpoints = await getEndpoints(info);
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
  });

});
