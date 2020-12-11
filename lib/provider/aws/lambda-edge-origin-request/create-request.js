'use strict';

const crypto = require('crypto');
const Request = require('../../../request');

function requestHeaders(event) {
  let headers = Object.keys(event.request.headers).reduce((headers, key) => {
    headers[event.request.headers[key][0].key.toLowerCase()] = event.request.headers[key][0].value;
    return headers;
  }, {});

  headers['x-request-id'] = crypto.randomBytes(30).toString('base64')

  return headers;
}

function requestBody(event) {
  const type = typeof event.request.body;
  const body = event && event.request && event.request.body;

  if (!body) return '';

  if (Buffer.isBuffer(event.request.body.data)) {
    return event.request.body.data;
  } else if (type === 'string') {
    return Buffer.from(event.request.body.data, event.request.body.encoding === 'base64' ? 'base64' : 'utf8');
  } else if (type === 'object') {
    return Buffer.from(JSON.stringify(event.request.body.data));
  }

  throw new Error(`Unexpected event.body type: ${typeof event.request.body.data}`);
}

function getUrl(path, queryString) {
  if (queryString) {
    return `${path}?${queryString}`
  }

  return path;
}

module.exports = (event, options) => {
  const method = event.request.method;
  const remoteAddress = event.request.clientIp;
  const headers = requestHeaders(event);
  const body = requestBody(event);

  if (typeof options.requestId === 'string' && options.requestId.length > 0) {
    const header = options.requestId.toLowerCase();
    headers[header] = headers[header] || event.config.requestId;
  }

  const req = new Request({
    method,
    headers,
    body,
    remoteAddress,
    url: getUrl(event.request.uri, event.request.querystring)
  });

  return req;
};
