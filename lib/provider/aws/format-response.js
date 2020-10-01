'use strict';

const isBinary = require('./is-binary');
const Response = require('../../response');
const sanitizeHeaders = require('./sanitize-headers');

module.exports = (event, response, options) => {
  const { statusCode } = response;
  const {headers, multiValueHeaders } = sanitizeHeaders(Response.headers(response));

  let cookies = [];

  if (multiValueHeaders['set-cookie']) {
    cookies = multiValueHeaders['set-cookie'];
  }

  const isBase64Encoded = isBinary(headers, options);
  const encoding = isBase64Encoded ? 'base64' : 'utf8';
  const body = Response.body(response).toString(encoding);

  let formattedResponse = { statusCode, headers, isBase64Encoded, body };

  if (event.version === '2.0' && cookies.length) {
    formattedResponse['cookies'] = cookies;
  }

  if ((!event.version || event.version === '1.0') && Object.keys(multiValueHeaders).length) {
    formattedResponse['multiValueHeaders'] = multiValueHeaders;
  }

  return formattedResponse;
};
