'use strict';

const isBinary = require('./is-binary');
const Response = require('../../response');
const sanitizeHeaders = require('./sanitize-headers');
const { getEventType, LAMBDA_EVENT_TYPES } = require('./get-event-type');

const combineHeaders = (headers, multiValueHeaders) => {
  return Object.entries(headers).reduce((memo, [key, value]) => {
    if (multiValueHeaders[key]) {
      memo[key].push(value);
    } else {
      memo[key] = [value];
    }
    return memo;
  }, multiValueHeaders);
}

module.exports = (event, response, options) => {
  const eventType = getEventType(event);
  const { statusCode } = response;
  const { headers, multiValueHeaders } = sanitizeHeaders(Response.headers(response));

  let cookies = [];

  if (multiValueHeaders['set-cookie']) {
    cookies = multiValueHeaders['set-cookie'];
  }

  const isBase64Encoded = isBinary(headers, options);
  const encoding = isBase64Encoded ? 'base64' : 'utf8';
  let body = Response.body(response).toString(encoding);

  if (headers['transfer-encoding'] === 'chunked' || response.chunkedEncoding) {
    const raw = Response.body(response).toString().split('\r\n');
    const parsed = [];
    for (let i = 0; i < raw.length; i +=2) {
      const size = parseInt(raw[i], 16);
      const value = raw[i + 1];
      if (value) {
        parsed.push(value.substring(0, size));
      }
    }
    body = parsed.join('')
  }

  if (eventType === LAMBDA_EVENT_TYPES.ALB) {
    const albResponse = { statusCode, isBase64Encoded, body };
    if (event.multiValueHeaders) {
      albResponse.multiValueHeaders = combineHeaders(headers, multiValueHeaders);
    } else {
      albResponse.headers = headers;
    }
    return albResponse;
  }

  if (eventType === LAMBDA_EVENT_TYPES.HTTP_API_V2) {
    return { statusCode, isBase64Encoded, body, headers, cookies };
  }

  // HTTP_API_V1 is the default
  return { statusCode, isBase64Encoded, body, headers, multiValueHeaders };
};
