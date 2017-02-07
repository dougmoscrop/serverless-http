'use strict';

module.exports = function getHandler(app) {
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
};
