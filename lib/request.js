'use strict';

const http = require('http');
const { PassThrough } = require('stream');

// IncomingMessage exposes headers twice: as an object, and as rawHeaders, a flat
// [name, value, name, value] list. Consumers that read rawHeaders directly - for
// example code that converts the request into a WHATWG Request - see an empty
// list unless it is populated here.
//
// The original casing and order of the wire headers is not available: providers
// normalise them before the request is constructed. Header names are
// case-insensitive, so lower-cased names are a faithful enough reconstruction.
function toRawHeaders(headers) {
  const raw = [];

  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        raw.push(name, String(item));
      }
    } else if (typeof value !== 'undefined') {
      raw.push(name, String(value));
    }
  }

  return raw;
}

module.exports = class ServerlessRequest extends http.IncomingMessage {
  constructor({ method, url, headers, body, remoteAddress }) {
    // Create a real readable socket for IncomingMessage instead of a stub.
    const socket = new PassThrough();
    socket.encrypted = true;
    socket.remoteAddress = remoteAddress;
    socket.address = () => ({ port: 443 });

    super(socket);

    if (typeof headers['content-length'] === 'undefined') {
      headers['content-length'] = Buffer.byteLength(body);
    }

    Object.assign(this, {
      ip: remoteAddress,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method,
      headers,
      rawHeaders: toRawHeaders(headers),
      body,
      url,
    });

    // Make the request stream readable by pushing the body when consumed.
    this._read = () => {
      if (typeof body !== 'undefined' && body !== null) {
        this.push(body);
      }
      this.push(null);
    };

    // If there's no body, emit 'end' on next tick so on-finished(req) fires
    // even when no one consumes the stream.
    if (!body || Buffer.byteLength(body) === 0) {
      setImmediate(() => this.emit('end'));
    }
  }
};
