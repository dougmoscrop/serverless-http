'use strict';

const http = require('http');
const stream = require('stream');

const headerEnd = '\r\n\r\n';

function getString(data) {
  if (Buffer.isBuffer(data)) {
    return data.toString();
  } else if (typeof data === 'string') {
    return data;
  } else {
    throw new Error(`response.write() of unexpected type: ${typeof data}`);
  }
}

module.exports = class ServerlessResponse extends http.ServerResponse {
  constructor(req) {
    super(req);

    this._body = [];
    this._headers = {};

    this.useChunkedEncodingByDefault = false;
    this.chunkedEncoding = false;

    this.addData = function(data) {
      if (Buffer.isBuffer(data)) {
        this._body.push(data);
      } else if (typeof data === 'string') {
        this._body.push(Buffer.from(data));
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
          this.addData(data);
        } else {
          const string = getString(data, encoding);
          const index = string.indexOf(headerEnd);

          if (index !== -1) {
            const remainder = string.slice(index + headerEnd.length);

            if (remainder) {
              this.addData(remainder);
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

      this.addData(data);

      if (typeof callback === 'function') {
        callback();
      }
    }

  }

};
