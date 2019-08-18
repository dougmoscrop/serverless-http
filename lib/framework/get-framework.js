'use strict';

const Response = require('../response');

function common(cb) {
  return request => {
    const response = new Response(request);

    cb(request, response);

    return response;
  };
}

module.exports = function getFramework(app) {
  if (typeof app.callback === 'function') {
    return common(app.callback());
  }

  if (typeof app.handle === 'function') {
    return common((request, response) => {
      app.handle(request, response);
    });
  }

  if (typeof app.handler === 'function') {
    return common((request, response) => {
      app.handler(request, response);
    });
  }

  if (typeof app === 'function') {
    return common(app);
  }

  if (app.router && typeof app.router.route == 'function') {
    return common((req, res) => {
      const { url, method, headers, body } = req;
      app.router.route({ url, method, headers, body }, res);
    });
  }

  if (app._core && typeof app._core._dispatch === 'function') {
    return common(app._core._dispatch({
      app
    }));
  }

  if (typeof app.inject === 'function') {
    return async request => {
      const { method, url, headers, body } = request;

      const res = await app.inject({ method, url, headers, payload: body })

      return Response.from(res);
    };
  }

  throw new Error('Unsupported framework');
};
