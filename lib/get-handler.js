'use strict';

const cleanUpEvent = require('./clean-up-event');
const finish = require('./finish');
const getBody = require('./get-body');
const isBinary = require('./is-binary');
const Request = require('./request');
const Response = require('./response');

function createHandler(cb, options) {
  return async (event_, context) => {
      const event = cleanUpEvent(event_);
      const request = new Request(event, options);

      await finish(request, event, context, options.request)
      const response = await cb(request);
      await finish(response, event, context, options.response);

      const { statusCode } = response;
      const headers = Response.headers(response);
      const isBase64Encoded = isBinary(headers, options);
      const body = getBody(response, headers, isBase64Encoded);

      return { isBase64Encoded, statusCode, headers, body };
  };
}

function wrap(cb) {
  return request => {
    const response = new Response(request);

    cb(request, response);

    return Promise.resolve(response);
  };
}

module.exports = function getHandler(app, options) {
  if (typeof app.callback === 'function') {
    const cb = wrap(app.callback());
    return createHandler(cb, options);
  }

  if (typeof app.handle === 'function') {
    const cb = wrap(app.handle.bind(app));
    return createHandler(cb, options);
  }

  if (typeof app === 'function') {
    const cb = wrap(app);
    return createHandler(cb, options);
  }

  if (app.router && typeof app.router.route == 'function') {
    const cb = wrap((req, res) => {
      const { url, method, headers, body } = req;
      app.router.route({ url, method, headers, body }, res);
    });
    return createHandler(cb, options);
  }

  if (app._core && typeof app._core._dispatch === 'function') {
    const cb = wrap(app._core._dispatch({
      app
    }));
    return createHandler(cb, options);
  }

  if (typeof app.inject === 'function') {
    const cb = async request => {
      const { method, url, headers, body } = request;
      const res = await app.inject({ method, url, headers, payload: body })
      return Response.from(res);
    };

    return createHandler(cb, options);
  }

  throw new Error('Unsupported framework');
};
