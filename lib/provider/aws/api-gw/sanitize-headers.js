'use strict';

module.exports = function sanitizeHeaders(headers) {
  return Object.keys(headers).reduce((memo, key) => {
      const value = headers[key];

    if (Array.isArray(value)) {
      memo.multiValueHeaders[key] = value;
      if (key.toLowerCase() !== 'set-cookie') {
        memo.headers[key] = value.join(", ");
      }
      } else {
        memo.headers[key] = value == null ? '' : value.toString();
      }

      return memo;
  }, {
      headers: {},
      multiValueHeaders: {}
    });
};
