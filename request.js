'use strict';

const http = require('http');
const url = require('url');

module.exports = class ServerlessRequest extends http.IncomingMessage {
  constructor(event) {
    super({
      encrypted: true,
      readable: false,
      remoteAddress: event.requestContext.identity.sourceIp
    });

    Object.assign(this, {
      ip: event.requestContext.identity.sourceIp,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method: event.httpMethod,
      headers: event.headers,
      url: url.format({
        pathname: event.path,
        query: event.queryStringParameters
      })
    });

    this.push(event.body);
    this.push(null);
  }
}
