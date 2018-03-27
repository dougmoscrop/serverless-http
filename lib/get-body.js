'use strict';

const Response = require('./response');

module.exports = function getBody(res, isBase64Encoded) {
  const isChunked = res._headers['transfer-encoding'] === 'chunked' || res.chunkedEncoding;

  if (isChunked) {
    throw new Error('chunked encoding not supported');
  }

  const encoding = isBase64Encoded ? 'base64' : 'utf8';

  return Response.body(res).toString(encoding);
};
