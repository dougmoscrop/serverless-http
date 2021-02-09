'use strict';

// See: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html#lambda-read-only-headers
const readOnlyHeaders = [
  'accept-encoding',
  'content-length',
  'if-modified-since',
  'if-none-Match',
  'if-range',
  'if-unmodified-since',
  'range',
  'transfer-encoding',
  'via'
];

// See: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html#lambda-blacklisted-headers
const blacklistedHeaders = [
  'connection',
  'expect',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'trailer',
  'upgrade',
  'x-accel-buffering',
  'x-accel-charset',
  'x-accel-limit-rate',
  'x-accel-redirect',
  'x-cache',
  'x-forwarded-proto',
  'x-real-ip',
]

const omittedHeaders = [...readOnlyHeaders, ...blacklistedHeaders]

module.exports = function sanitizeHeaders(headers) {
  return Object.keys(headers).reduce((memo, key) => {
    const value = headers[key];
    const normalizedKey = key.toLowerCase();

    if (omittedHeaders.includes(normalizedKey)) {
        return memo;
    }

    if (memo[normalizedKey] === undefined) {
      memo[normalizedKey] = []
    }

    const valueArray = Array.isArray(value) ? value : [value]

    valueArray.forEach(valueElement => {
      memo[normalizedKey].push({
        key: key,
        value: valueElement
      });
    });

    return memo;
  }, {});
};
