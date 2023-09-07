'use strict';

/* eslint-disable no-console */

const { URL } = require('url');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process')
const kill = require('tree-kill');

const { expect } = require('chai');
const supertest = require('supertest');

function sleep(ms) {
  return new Promise((resolve) => setInterval(resolve, ms));
}

async function runSpawned(cmd) {
  const subprocess = spawn("npx", ["serverless", cmd])
  let output = "";
  subprocess.stdout.on('data', (data) => {
    output += data;
  }); 
  subprocess.stderr.on('data', (data) => {
    output += data;
  }); 
  while (!output.includes("Server ready:")) {
    await sleep(500);
  }
  return {subprocess, output};
}

const endpointRegex = /ANY \| (http[^\n\r ]+)/g

function getEndpoints(info) {
  let memo = [];
  const matches = info.matchAll(endpointRegex);
  for (const m of matches) {
    const url = new URL(m[1]);
    memo.push(url);
  }
  return memo;
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
      process.env.RUNTIME = runtime;
      const { subprocess, output } = await runSpawned('offline');
      endpoints = getEndpoints(output);
      this.subprocess = subprocess;
    });

    after(async function() {
      let done = false;
      this.subprocess.on('close', () => {
        done = true;
      })      
      kill(this.subprocess.pid);
      while (!done) {
        await sleep(500);
      }
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

    // FIXME: Broken currently https://github.com/dougmoscrop/serverless-http/issues/270
    it.skip('root', () => {
      const endpoint = getEndpoint('/dev');

      return supertest(endpoint.origin)
        .get(endpoint.pathname)
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });

});
