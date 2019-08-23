'use strict';

const fs = require('fs');
const path = require('path');

module.exports.handler = async (event) => {
  const expected = new Buffer(fs.readFileSync(path.join(__dirname, 'test.xlsx'), { encoding: 'binary' }));

  const { body } = event;

  const actualBinary = Buffer.from(body, 'binary');
  const actualUtf8 = Buffer.from(body, 'utf8');

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      expectedBytes: Buffer.byteLength(expected),
      binary: {
        actualBytes: Buffer.byteLength(actualBinary),
        equal: expected.equals(actualBinary),
      },
      utf8: {
        actualBytes: Buffer.byteLength(actualUtf8),
        equal: expected.equals(actualUtf8),
      },
    }),
  };
};
