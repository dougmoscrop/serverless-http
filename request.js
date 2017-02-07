'use strict';

const http = require('http');
const url = require('url');

function getHeaders(event) {
  return Object.keys(event.headers).reduce((headers, key) => {
    headers[key.toLowerCase()] = event.headers[key];
    return headers;
  }, {});
}

function getBody(event) {
  // this only really applies during some tests and invoking a lambda directly
  if (typeof event.body === 'object' && !Buffer.isBuffer(event.body)) {
    return JSON.stringify(event.body);
  }
  return event.body;
}

module.exports = class ServerlessRequest extends http.IncomingMessage {
  constructor(event, options) {
    super({
      encrypted: true,
      readable: false,
      remoteAddress: event.requestContext.identity.sourceIp
    });

    const headers = getHeaders(event);
    const body = getBody(event);

    if (typeof headers['content-length'] == 'undefined') {
      headers['content-length'] = body.length;
    }

    if (typeof options.requestId === 'string' && options.requestId.length > 0) {
      const requestId = options.requestId.toLowerCase();
      headers[requestId] = headers[requestId] || event.requestContext.requestId;
    }

    Object.assign(this, {
      ip: event.requestContext.identity.sourceIp,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method: event.httpMethod,
      headers: headers,
      url: url.format({
        pathname: event.path,
        query: event.queryStringParameters
      })
    });

    this.push(body);
    this.push(null);
  }
}
