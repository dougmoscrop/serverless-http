'use strict';

module.exports = function getString(data) {
  if (Buffer.isBuffer(data)) {
    return data.toString();
  } else if (typeof data === 'string') {
    return data;
  } else {
    throw new Error(`response.write() of unexpected type: ${typeof data}`);
  }
};
