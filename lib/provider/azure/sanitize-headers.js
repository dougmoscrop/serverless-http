'use strict';

const setCookieVariations = require('./set-cookie.json').variations;

module.exports = function sanitizeHeaders(headers) {
  return Object.keys(headers).reduce((memo, key) => {
      const value = headers[key];

      if (Array.isArray(value)) {
        if (key.toLowerCase() === 'set-cookie') {
          value.forEach((cookie, i) => {
            memo[setCookieVariations[i]] = cookie;
          });
        } else {
          memo[key] = value.join(', ');
        }
      } else {
        memo[key] = value == null ? '' : value.toString();
      }

      return memo;
    }, {});
};
