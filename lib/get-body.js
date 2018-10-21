'use strict';

const Response = require('./response');

module.exports = function getBody(res, headers, isBase64Encoded) {
  const isChunked = headers['transfer-encoding'] === 'chunked' || res.chunkedEncoding;

  if (isChunked) {
    throw new Error('chunked encoding not supported');
  }

  const encoding = isBase64Encoded ? 'base64' : 'utf8';

  return Response.body(res).toString(encoding);
};
