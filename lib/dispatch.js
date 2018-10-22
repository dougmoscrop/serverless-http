'use strict';

module.exports = function dispatch(promise, callback) {
  if (callback) {
    promise.then(result => {
      process.nextTick(() => {
        callback(null, result);
      });
    })
    .catch(e => {
      process.nextTick(() => {
        callback(e);
      });
    });

    return;
  }

  return promise;
}
