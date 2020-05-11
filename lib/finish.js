'use strict';

module.exports = async function finish(item, transform, ...details) {
  await new Promise((resolve, reject) => {
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

      item.removeListener('error', done);
      item.removeListener('end', done);
      item.removeListener('finish', done);

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }

    item.once('error', done);
    item.once('end', done);
    item.once('finish', done);
  });

  if (typeof transform === 'function') {
    await transform(item, ...details);
  } else if (typeof transform === 'object' && transform !== null) {
    Object.assign(item, transform);
  }

  return item;
};
