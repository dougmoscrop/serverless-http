'use strict';

const url = require('url');

const Request = require('../../request');

function requestMethod(event) {
  if (!event || !event.version || event.version === '1.0') return event.httpMethod;
  if (event.version === '2.0') return event.requestContext.http.method;
}

function requestQuery(event) {
  if (!event || !event.version || event.version === '1.0')
    return event.multiValueQueryStringParameters || event.queryStringParameters;

  if (event.version === '2.0') return event.queryStringParameters;
}

function requestRemoteAddress(event) {
  if(!event || !event.version || event.version === '1.0') return event.requestContext.identity.sourceIp;
  if (event.version === '2.0') return event.requestContext.http.sourceIp;
}

function requestCookiesPayloadV2(event) {
  if (Array.isArray(event.cookies)) {
    return { cookie: event.cookies.join('; ') }
  } else {
    return {}
  }
}

function requestHeaders(event) {
  const initialHeader = event.version === '2.0' ? requestCookiesPayloadV2(event) : {};
  return Object.keys(event.headers).reduce((headers, key) => {
    headers[key.toLowerCase()] = event.headers[key];
    return headers;
  }, initialHeader);
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

function requestUrl(event, query) {
  if(!event || !event.version || event.version === '1.0') {
    return url.format({
      pathname: event.path,
      query,
    })

  } else if (event.version === '2.0') {
    return `${event.rawPath}${event.rawQueryString ? '?'+event.rawQueryString : ''}`;
  }
}

module.exports = (event, options) => {
  const method = requestMethod(event);
  const query = requestQuery(event);
  const remoteAddress = requestRemoteAddress(event);
  const headers = requestHeaders(event);
  const body = requestBody(event);
  const url = requestUrl(event, query);

  if (typeof options.requestId === 'string' && options.requestId.length > 0) {
    const header = options.requestId.toLowerCase();
    headers[header] = headers[header] || event.requestContext.requestId;
  }

  const req = new Request({
    method,
    headers,
    body,
    remoteAddress,
    url,
  });

  req.requestContext = event.requestContext;
  return req;
};
