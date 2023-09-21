'use strict';

/* eslint-disable no-console */

const common = require('./test-common');
const { URL } = require('url');
const { spawn } = require('child_process')
const kill = require('tree-kill');

function sleep(ms) {
  return new Promise((resolve) => setInterval(resolve, ms));
}

async function runSpawned(cmd) {
  const subprocess = spawn("npx", ["serverless", cmd])
  let output = "";
  subprocess.stdout.setEncoding('utf-8');
  subprocess.stdout.on('data', (data) => {
    output += data;
  }); 
  subprocess.stderr.setEncoding('utf-8');
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

common.runtimes.forEach(runtime => {
  describe(runtime, function () {
    this.slow(5000);
    this.timeout(10000);

    before(async function() {
      this.timeout(0);
      process.env.RUNTIME = runtime;
      const { subprocess, output } = await runSpawned('offline');
      this.endpoints = getEndpoints(output);
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

    common.shouldBehaveLikeIntegration();
  });

});
