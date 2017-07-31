'use strict';

const http = require('http');
const stream = require('stream');

module.exports = class ServerlessResponse extends http.ServerResponse {
  constructor(req) {
    super(req);

    this._body = [];

    this.assignSocket(new stream.Writable({
      // ignore the data intended for the socket and grab the body below
      write: (data, encoding, done) => {
        if (typeof encoding === 'function') {
          done = encoding;
        }

        if (typeof done === 'function') {
          done();
        }
      }
    }));

    this.write = function(data) {
      if (Buffer.isBuffer(data)) {
        this._body.push(data);
      } else if (typeof data === 'string') {
        this._body.push(Buffer.from(data))
      } else {
        throw new Error(`response.write() of unexpected type: ${typeof data}`);
      }
    };
  }
};
