'use strict';

const url = require('url');

const Request = require('../../request');

function requestHeaders(event) {
  return Object.keys(event.headers).reduce((headers, key) => {
    headers[key.toLowerCase()] = event.headers[key];
    return headers;
  }, {});
}

function requestBody(event) {
  const type = typeof event.body;

  if (Buffer.isBuffer(event.body)) {
    return event.body;
  } else if (type === 'string') {
    return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  } else if (type === 'object') {
    return Buffer.from(JSON.stringify(event.body));
  }

  throw new Error(`Unexpected event.body type: ${typeof event.body}`);
}

module.exports = (event, options) => {
  const method = event.httpMethod;
  const query = event.multiValueQueryStringParameters || event.queryStringParameters;
  const remoteAddress = event.requestContext.identity.sourceIp;
  const headers = requestHeaders(event);
  const body = requestBody(event);

  if (typeof options.requestId === 'string' && options.requestId.length > 0) {
    const header = options.requestId.toLowerCase();
    headers[header] = headers[header] || event.requestContext.requestId;
  }

  let pathname = event.path
  // NOTE: if used directly via new API Gateway v2 (i.e. HTTP-API)
  if (event.requestContext && event.requestContext.stage && event.requestContext.resourcePath &&
      event.path.indexOf(`/${event.requestContext.stage}/`) === 0 &&
      event.requestContext.resourcePath.indexOf(`/${event.requestContext.stage}/`) !== 0) {
        pathname = event.path.substring(event.requestContext.stage.length + 1)
  }

  const req = new Request({
    method,
    headers,
    body,
    remoteAddress,
    url: url.format({
      pathname,
      query,
    }),
  });
  req.requestContext = event.requestContext;
  return req;
};
