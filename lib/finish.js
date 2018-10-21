'use strict';

module.exports = function finish(item, event, context, transform) {
  return new Promise((resolve, reject) => {
    if (item.finished || item.complete) {
      resolve();
      return;
    }

    let finished = false;

    function done(err) {
      if (finished) {
        return;
      }

      finished = true;

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }

    item.once('end', (err) => {
      item.removeListener('finish', done);
      done(err);
    });

    item.once('finish', (err) => {
      item.removeListener('done', done);
      done(err);
    });
  })
  .then(() => {
    if (typeof transform === 'function') {
      return transform(item, event, context);
    } else if (typeof transform === 'object' && transform !== null) {
      Object.assign(item, transform);
    }
  })
  .then(() => {
    return item;
  });
}
