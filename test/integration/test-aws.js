'use strict';

/* eslint-disable no-console */

const { URL } = require('url');
const { execSync } = require('child_process')
const common = require('./test-common');

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

common.runtimes.forEach(runtime => {
  describe(runtime, function () {
    this.slow(5000);
    this.timeout(10000);

    before(function() {
      this.timeout(0);
      process.env.RUNTIME = runtime
      run('deploy');
    });

    before(async function() {
      this.timeout(10000);
      const info = run('info');
      this.endpoints = await getEndpoints(info.split('\r?\n'));
    });

    common.shouldBehaveLikeIntegration();
  });

});
