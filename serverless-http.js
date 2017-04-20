'use strict';

const finish = require('./lib/finish');
const sanitizeHeaders = require('./lib/sanitize-headers');
const getHandler = require('./lib/get-handler');

const Request = require('./lib/request');
const Response = require('./lib/response');

const defaultOptions = {
  requestId: 'x-request-id'
};

module.exports = function(app, opts) {
  const handler = getHandler(app);
  const options = Object.assign({}, defaultOptions, opts);

  return (evt, ctx, callback) => {
    if (options.callbackWaitsForEmptyEventLoop != null) {
      ctx.callbackWaitsForEmptyEventLoop = options.callbackWaitsForEmptyEventLoop;
    }

    Promise.resolve()
      .then(() => {
        const context = ctx || {};
        const event = cleanupEvent(evt);

        const request = new Request(event, options);

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
