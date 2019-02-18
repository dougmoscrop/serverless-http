'use strict';

const http = require('http');
const url = require('url');

function getHeaders(event) {
  return Object.keys(event.headers).reduce((headers, key) => {
    headers[key.toLowerCase()] = event.headers[key];
    return headers;
  }, {});
}

function getBody(event, headers) {
  if (typeof event.body === 'string') {
    return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  } else if (Buffer.isBuffer(event.body)) {
    return event.body;
  } else if (typeof event.body === 'object') {
    const contentType = headers['content-type'];

    if (contentType && contentType.indexOf('application/json') === 0) {
      return Buffer.from(JSON.stringify(event.body));
    } else {
      throw new Error('event.body was an object but content-type is not json');
    }
  }

  throw new Error(`Unexpected event.body type: ${typeof event.body}`);
}

module.exports = class ServerlessRequest extends http.IncomingMessage {
  constructor(event, options) {
    super({
      encrypted: true,
      readable: false,
      remoteAddress: event.requestContext.identity.sourceIp,
      address: () => {
        return { port: 443 };
      },
      end: Function.prototype
    });

    const headers = getHeaders(event);
    const body = getBody(event, headers);

    if (typeof headers['content-length'] === 'undefined') {
      headers['content-length'] = String(Buffer.byteLength(body));
    }

    if (typeof options.requestId === 'string' && options.requestId.length > 0) {
      const requestId = options.requestId.toLowerCase();
      headers[requestId] = headers[requestId] || event.requestContext.requestId;
    }

    const baseUrl = event.requestContext.path.slice(0, -event.path.length);

    Object.assign(this, {
      ip: event.requestContext.identity.sourceIp,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method: event.httpMethod,
      headers,
      body,
      baseUrl,
      originalUrl: url.format({
        pathname: event.requestContext.path,
        query: event.multiValueQueryStringParameters || event.queryStringParameters
      }),
      url: url.format({
        pathname: event.path,
        query: event.multiValueQueryStringParameters || event.queryStringParameters
      }),
    });

    this.push(body);
    this.push(null);
  }

}
