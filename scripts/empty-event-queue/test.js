'use strict';

function deploy() {
  return Promise.resolve('foo');
}

function test() {
}

function printResults() {

}

function teardown() {
}

return deploy()
  .then(() =>
    Promise.all([
      test('true'),
      test('false')
    ])
  )
  .then(printResults)
  .then(teardown);
