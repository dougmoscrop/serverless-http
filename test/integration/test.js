'use strict';

/* eslint-disable no-console */

const { URL } = require('url');
const path = require('path');
const fs = require('fs');

const Serverless = require('serverless')
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

const tests = {
  '/dev/express': url => {
    return supertest(url.origin)
      .get(url.pathname)
      .expect(200)
      .expect('Content-Type', /json/);
  },
  '/dev/koa': url => {
    return supertest(url.origin)
      .get(url.pathname)
      .expect(200)
      .expect('Content-Type', /json/);
  },
  '/dev/binary': url => {
    const imagePath = path.join(__dirname, 'image.png');
    const expected = fs.readFileSync(imagePath);

    return supertest(url.origin)
      .get(url.pathname)
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
  }
};

Promise.resolve()
  .then(() => {
    return run('deploy');
  })
  .then(() => {
    return run('info');
  })
  .then(info => {
    return getEndpoints(info);
  })
  .then(endpoints => {
    return Promise.all(
      Object.keys(tests).map(path => {
        const check = tests[path];
        const endpoint = endpoints.find(e => e.pathname === path);

        if (endpoint) {
          console.log('Testing', path);
          return check(endpoint);
        } else {
          throw new Error('Missing endpoint for', path);
        }
      })
    )
  })
  .then(() => {
    console.log('Test succeded!');
  })
  .catch(e => {
    console.error('Test failed: ', e, e.stackTrace);
    process.exitCode = 1;
  })
  .then(() => {
    return run('remove');
  });
