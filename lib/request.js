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
  if (typeof event.body === 'string') {
    return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  }
  throw new Error(`Unexpected event.body type: ${typeof event.body}`);
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

    if (typeof headers['content-length'] === 'undefined') {
      headers['content-length'] = Buffer.byteLength(body);
    }

    if (typeof options.requestId === 'string' && options.requestId.length > 0) {
      const requestId = options.requestId.toLowerCase();
      headers[requestId] = headers[requestId] || event.requestContext.requestId;
    }

    const baseUrl = event.requestContext.path ?  // This isn't set in serverless offline
      event.requestContext.path.substring(0, event.requestContext.path.length - event.path.length) :
      "";

    // Alternative - Hard-code baseUrl to /<stage>
//    const baseUrl = "/" + event.requestContext.stage;

    const relativeUrl = url.format({
      pathname: event.path,
      query: event.queryStringParameters
    });

    Object.assign(this, {
      ip: event.requestContext.identity.sourceIp,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method: event.httpMethod,
      headers: headers,
      baseUrl,
      url: relativeUrl,
      originalUrl: baseUrl + relativeUrl
    });

    this.push(body);
    this.push(null);
  }
}
