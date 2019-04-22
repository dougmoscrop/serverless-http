'use strict';

const url = require('url');

const Request = require('../../request');

function requestHeaders(event) {
  return Object.keys(event.headers).reduce((headers, key) => {
    headers[key.toLowerCase()] = event.headers[key];
    return headers;
  }, {});
}

function requestBody(event, headers) {
  if (typeof event.body === 'string') {
    return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  } else if (Buffer.isBuffer(event.body)) {
    return event.body;
  } else if (typeof event.body === 'object') {
    const contentType = headers['content-type'];

    if (contentType && contentType.indexOf('application/json') === 0) {
      return Buffer.from(JSON.stringify(event.body));
    }

    throw new Error('event.body was an object but content-type is not json');
  }

  throw new Error(`Unexpected event.body type: ${typeof event.body}`);
}

module.exports = (event, options) => {
  const method = event.httpMethod;
  const query = event.multiValueQueryStringParameters || event.queryStringParameters;
  const baseUrl = event.requestContext.path.slice(0, -event.path.length);
  const remoteAddress = event.requestContext.identity.sourceIp;
  const headers = requestHeaders(event);
  const body = requestBody(event, headers);

  if (typeof options.requestId === 'string' && options.requestId.length > 0) {
    const header = options.requestId.toLowerCase();
    headers[header] = headers[header] || event.requestContext.requestId;
  }

  return new Request({
    method,
    baseUrl,
    headers,
    body,
    remoteAddress,
    originalUrl: url.format({
      pathname: event.requestContext.path,
      query,
    }),
    url: url.format({
      pathname: event.path,
      query,
    }),
  });
};
