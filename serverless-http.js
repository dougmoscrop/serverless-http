'use strict';

const events = require('events');
const httpMocks = require('node-mocks-http');
const queryString = require('query-string');

function getHandler(app) {
  if (typeof app.callback === 'function') {
    return app.callback();
  }

  if (typeof app.handle === 'function') {
    return app.handle.bind(app);
  }

  throw new Error('serverless-http only supports koa and express/connect');
}

module.exports = function(app) {
  const handler = getHandler(app);
  return (event, context, callback) => {
    const req = httpMocks.createRequest({
      path: event.path,
      url: `${event.path}?${queryString.stringify(event.queryStringParameters)}`,
      query: event.queryStringParameters,
      method: event.httpMethod,
      headers: event.headers,
      body: event.body,
      // these are various stubs required to get frameworks working
      socket: { encrypted: true },
      _readableState: {},
      resume: Function.prototype
    });

    if (!req.headers['content-length'] && req.body.length) {
      req.headers['content-length'] = req.body.length;
    }

    const res = httpMocks.createResponse({
      eventEmitter: events.EventEmitter
    });

    res.finished = false;
    res.once('end', function() {
      callback(null, {
        statusCode: res._getStatusCode(),
        headers: res._getHeaders(),
        body: res._getData()
      });
    });

    handler(req, res);
    req.emit('open')
    req.emit('data', req.body);
    req.emit('end');
    req.emit('close');
  };
};
