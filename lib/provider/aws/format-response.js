'use strict';

const isBinary = require('./is-binary');
const Response = require('../../response');
const sanitizeHeaders = require('./sanitize-headers');

module.exports = (response, options) => {
  const { statusCode } = response;
  const headers = sanitizeHeaders(Response.headers(response));

  if (headers['transfer-encoding'] === 'chunked' || response.chunkedEncoding) {
    throw new Error('chunked encoding not supported');
  }

  const isBase64Encoded = isBinary(headers, options);
  const encoding = isBase64Encoded ? 'base64' : 'utf8';
  const body = Response.body(response).toString(encoding);

  return { statusCode, headers, isBase64Encoded, body };
};
