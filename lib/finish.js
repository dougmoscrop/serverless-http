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

      item.removeListener('finish', done);
      item.removeListener('done', done);

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }

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
