'use strict';

const onFinished = require('on-finished');
const binarycase = require('binary-case');

const Request = require('./request');
const Response = require('./response');

const defaultOptions = {
  requestId: 'x-request-id'
};

function finish(item, event, context, transform) {
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
      return transform(item, event, context);
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
        const event = cleanupEvent(evt);

        const request = new Request(event, context, options);

        return finish(request, event, context, options.request)
          .then(() => {
            const response = new Response(request);

            handler(request, response);

            return finish(response, event, context, options.response);
          });
    })
    .then(res => {
      process.nextTick(() => {
        callback(null, {
          statusCode: res.statusCode,
          headers: sanitizeHeaders(res._headers),
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

function cleanupEvent(evt) {
  const event = evt || {};

  event.httpMethod = event.httpMethod || 'GET';
  event.path = event.path || '/';
  event.body = event.body || '';
  event.headers = event.headers || {};
  event.requestContext = event.requestContext || {};
  event.requestContext.identity = event.requestContext.identity || {};

  return event;
}

function sanitizeHeaders(headers) {
  headers = headers || {};
  return Object.keys(headers).reduce((memo, key) => {
      const value = headers[key];
      if (Array.isArray(value)) {
        if (key.toLowerCase() === 'set-cookie') {
          value.forEach((cookie, i) => {
            memo[binarycase(key, i)] = cookie;
          });
        } else {
          memo[key] = value.join(', ');
        }
      } else {
        memo[key] = value;
      }
      return memo;
    }, {});
}
