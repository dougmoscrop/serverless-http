'use strict';

const events = require('events');
const httpMocks = require('node-mocks-http');

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
      method: event.httpMethod,
      headers: event.headers,
      socket: { encrypted: true }
    });
    const res = httpMocks.createResponse({
      eventEmitter: events.EventEmitter
    });

    res.on('end', function() {
      callback(null, {
        statusCode: res._getStatusCode(),
        headers: res._getHeaders(),
        body: res._getData()
      });
    });

    handler(req, res);
    req.emit('open')
    req.emit('data', event.body);
    req.emit('end');
    req.emit('close');
  };
};
