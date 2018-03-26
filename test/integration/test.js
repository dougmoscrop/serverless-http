'use strict';

/* eslint-disable no-console */

const Serverless = require('serverless')
const intercept = require('intercept-stdout');
const got = require('got');

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

run('deploy')
  .then(() => {
    return run('info');
  })
  .then(info => {
    return info.reduce((memo, msg) => {
      if (msg.indexOf('endpoints') !== -1) {
        return memo.then(() => {
          return Promise.all(msg.split('\n').slice(1).map(e => {
            if (e) {
              const url = e.replace('  ANY - ', '');
              console.log('get', url);
              return got.get(url);
            }
          }));
        });
      }
      return memo;
    }, Promise.resolve());
  })
  .then(responses => {
    return responses.map(r => {
      if (!r) {
        return;
      }

      if (r.statusCode !== 200) {
        throw new Error('expected statusCode 200');
      }

      if (r.body !== 'This is a test') {
        throw new Error(`expected body 'This is a test'`);
      }
    });
  })
  .then(() => {
    console.log('Test succeded!');
  })
  .catch(e => {
    console.error('Test failed: ', e, e.stackTrace);
    process.exitCode = 1;
  })
  .then(() => {
    // return run('remove');
  });
