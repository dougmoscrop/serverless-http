'use strict';

const http = require('http');
const stream = require('stream');

const getString = require('./get-string');

const headerEnd = '\r\n\r\n';

const BODY = Symbol();

module.exports = class ServerlessResponse extends http.ServerResponse {

  static body(res) {
    return Buffer.concat(res[BODY]);
  }

  constructor(req) {
    super(req);

    this[BODY] = [];

    this._headers = {};

    this.useChunkedEncodingByDefault = false;
    this.chunkedEncoding = false;

    const addData = (data) => {
      if (Buffer.isBuffer(data) || typeof data === 'string') {
        this[BODY].push(Buffer.from(data));
      } else {
        throw new Error(`response.write() of unexpected type: ${typeof data}`);
      }
    }

    this.assignSocket(new stream.Writable({
      // sometimes the data is written directly to the socket
      write: (data, encoding, done) => {
        if (typeof encoding === 'function') {
          done = encoding;
          encoding = null;
        }

        if (this._wroteHeader) {
          addData(data);
        } else {
          const string = getString(data);
          const index = string.indexOf(headerEnd);

          if (index !== -1) {
            const remainder = string.slice(index + headerEnd.length);

            if (remainder) {
              addData(remainder);
            }

            this._wroteHeader = true;
          }
        }

        if (typeof done === 'function') {
          done();
        }
      }
    }));

    this.write = function(data, encoding, callback) {
      if (typeof encoding === 'function') {
        callback = encoding;
        encoding = null;
      }

      addData(data);

      if (typeof callback === 'function') {
        callback();
      }
    }

  }

};
