'use strict';

const stream = require('stream');

const httpMocks = require('node-mocks-http');
const queryString = require('query-string');
const onFinished = require('on-finished');

module.exports = function(app) {
  const handler = getHandler(app);

  return (event, context, callback) => {
    try {
      cleanupEvent(event);

      const req = createRequest(event);
      const res = createResponse();

      onFinished(req, function(err) {
        if (err) {
          callback(err);
          return;
        }

        onFinished(res, function(err) {
          if (err) {
            callback(err);
            return;
          }

          callback(null, {
            statusCode: res._getStatusCode(),
            headers: res._getHeaders(),
            body: res._getData()
          });
        });

        handler(req, res)
      });
    } catch (e) {
      callback(e);
    }
  };
};

function getHandler(app) {
  if (typeof app.callback === 'function') {
    return app.callback();
  }

  if (typeof app.handle === 'function') {
    return app.handle.bind(app);
  }

  throw new Error('serverless-http only supports koa and express/connect');
}

function cleanupEvent(event) {
  event.body = event.body || '';

  // this only really applies during some tests and invoking a lambda directly
  if (typeof event.body === 'object' && !Buffer.isBuffer(event.body)) {
    event.body = JSON.stringify(event.body);
  }

  event.headers = event.headers || {};

  if (typeof event.headers['content-length'] == 'undefined') {
    event.headers['content-length'] = event.body.length;
  }

  event.requestContext = event.requestContext || {};
  event.requestContext.identity = event.requestContext.identity || {};
}

function createRequest(event) {
  const req = httpMocks.createRequest({
    eventEmitter: stream.Readable,
    path: event.path,
    url: `${event.path}?${queryString.stringify(event.queryStringParameters)}`,
    query: event.queryStringParameters,
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
    // this is required to be faked
    socket: { encrypted: true, readable: false },
    connection: { sourceIp: event.requestContext.identity.sourceIp },
    complete: true
  });
  req.push(event.body);
  req.push(null);

  return req;
}

function createResponse() {
  const res = httpMocks.createResponse({
    eventEmitter: stream.Writable,
  });
  res.finished = false;
  res.once('end', function() {
    res.finished = true;
  });

  return res;
}
