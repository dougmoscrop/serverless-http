'use strict';

const cleanUpEvent = require('./clean-up-event');
const finish = require('./finish');
const getBody = require('./get-body');
const isBinary = require('./is-binary');
const Request = require('./request');
const Response = require('./response');

function createHandler(cb, options) {
  return (event_, context) => {
    return Promise.resolve()
      .then(() => {
        const event = cleanUpEvent(event_);
        const request = new Request(event, options);

        return finish(request, event, context, options.request)
          .then(request => {
            const response = new Response(request);
            return Promise.resolve()
              .then(() => cb(request, response))
              .then(responseOverride => {
                return responseOverride || response;
              });
          })
          .then(response => {
            return finish(response, event, context, options.response);
          })
          .then(response => {
            const { statusCode } = response;
            const headers = Response.headers(response);
            const isBase64Encoded = isBinary(headers, options);
            const body = getBody(response, headers, isBase64Encoded);

            return { isBase64Encoded, statusCode, headers, body };
          });
      });
  };
}

module.exports = function getHandler(app, options) {
  if (typeof app.callback === 'function') {
    const cb = app.callback();
    return createHandler(cb, options);
  }

  if (typeof app.handle === 'function') {
    const cb = app.handle.bind(app);
    return createHandler(cb, options);
  }

  if (typeof app === 'function') {
    return createHandler(app, options);
  }

  if (app.router && typeof app.router.route == 'function') {
    const cb = (req, res) => {
      const { url, method, headers, body } = req;
      app.router.route({ url, method, headers, body }, res);
    };
    return createHandler(cb, options);
  }

  if (app._core && typeof app._core._dispatch === 'function') {
    const cb = app._core._dispatch({
      app
    });
    return createHandler(cb, options);
  }

  if (typeof app.inject === 'function') {
    const cb = request => {
      const { method, url, headers, body } = request;
      return app.inject({ method, url, headers, payload: body })
        .then(res => {
          return Response.from(res);
        });
    };

    return createHandler(cb, options);
  }

  throw new Error('Unsupported framework');
};
