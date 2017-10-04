'use strict';

const finish = require('./lib/finish');
const getHandler = require('./lib/get-handler');
const cleanUpEvent = require('./lib/clean-up-event');
const sanitizeHeaders = require('./lib/sanitize-headers');
const getBody = require('./lib/get-body');
const isBinary = require('./lib/is-binary');

const Request = require('./lib/request');
const Response = require('./lib/response');

const defaultOptions = {
  requestId: 'x-request-id'
};

module.exports = function(app, opts) {
  const handler = getHandler(app);
  const options = Object.assign({}, defaultOptions, opts);

  return (evt, ctx, callback) => {

    ctx.callbackWaitsForEmptyEventLoop = !!options.callbackWaitsForEmptyEventLoop;

    Promise.resolve()
      .then(() => {
        const context = ctx || {};
        const event = cleanUpEvent(evt);

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
        const statusCode = res.statusCode;
        const headers = sanitizeHeaders(res._headers);
        const isBase64Encoded = isBinary(headers, options);
        const body = getBody(res, isBase64Encoded);

        callback(null, {
          isBase64Encoded,
          statusCode,
          headers,
          body
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
