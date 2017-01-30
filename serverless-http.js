'use strict';

const onFinished = require('on-finished');

const Request = require('./request');
const Response = require('./response');

const defaultOptions = {
  requestId: 'x-request-id'
};

function finish(item, transform) {
  return new Promise((resolve, reject) => {
    onFinished(item, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  })
  .then(() => {
    if (typeof transform === 'function') {
      return transform(item);
    } else if (typeof transform === 'object' && transform !== null) {
      Object.assign(item, transform);
    }
  })
  .then(() => item);
}

module.exports = function(app, opts) {
  const handler = getHandler(app);
  const options = Object.assign({}, defaultOptions, opts);

  return (evt, ctx, callback) => {
    Promise.resolve()
      .then(() => {
        const context = ctx || {};
        const event = cleanupEvent(evt, context, options);

        const request = new Request(event, context);

        return finish(request, options.request)
          .then(() => {
            const response = new Response(request);

            handler(request, response);

            return finish(response, options.response);
          });
    })
    .then(res => {
      process.nextTick(() => {
        callback(null, {
          statusCode: res.statusCode,
          headers: res._headers,
          body: res._body
        });
      });
    })
    .catch(e => {
      process.nextTick(() => {
        callback(e);
      });
    });
  };
};

function getHandler(app) {
  if (typeof app.callback === 'function') {
    return app.callback();
  }

  if (typeof app.handle === 'function') {
    return app.handle.bind(app);
  }

  if (typeof app === 'function') {
    return app;
  }

  throw new Error('serverless-http only supports koa, express/connect or a generic http listener');
}

function cleanupEvent(evt, ctx, options) {
  const event = evt || {};

  event.httpMethod = event.httpMethod || 'GET';
  event.path = event.path || '/';
  event.body = event.body || '';
  event.headers = event.headers || {};
  event.requestContext = event.requestContext || {};
  event.requestContext.identity = event.requestContext.identity || {};

  event.headers = Object.keys(event.headers).reduce((headers, key) => {
    headers[key.toLowerCase()] = event.headers[key];
    return headers;
  }, {});

  // this only really applies during some tests and invoking a lambda directly
  if (typeof event.body === 'object' && !Buffer.isBuffer(event.body)) {
    event.body = JSON.stringify(event.body);
  }

  if (typeof event.headers['content-length'] == 'undefined') {
    event.headers['content-length'] = event.body.length;
  }

  if (typeof options.requestId === 'string' && options.requestId.length > 0) {
    const requestId = options.requestId.toLowerCase();
    event.headers[requestId] = event.headers[requestId] || ctx.awsRequestId;
  }

  return event;
}
