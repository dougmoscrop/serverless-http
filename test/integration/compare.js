'use strict';

const fs = require('fs');
const path = require('path');

module.exports.handler = async (event) => {
  const expected = fs.readFileSync(path.join(__dirname, 'image.png'));
  const { body } = event;

  const actual = Buffer.isBuffer(body)
    ? body
    : Buffer.from(
        typeof body === 'string'
          ? body
          : JSON.stringify(body)
      );

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      actualBytes: Buffer.byteLength(actual),
      expectedBytes: Buffer.byteLength(expected),
      bytesEqual: actual.equals(expected),
    }),
  };
};
