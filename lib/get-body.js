'use strict';

module.exports = function getBody(res, isBase64Encoded) {
  const isChunked = res._headers['transfer-encoding'] === 'chunked' || res.chunkedEncoding;

  if (isChunked) {
    throw new Error('chunked encoding not supported');
  }

  if (isBase64Encoded) {
    return Buffer.concat(res.__body).toString('base64');
  }

  return Buffer.concat(res.__body).toString('utf8');
};
