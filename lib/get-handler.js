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

  if (app.router && typeof app.router.route == 'function') {
    return (req, res) => {
      const { url, method, headers, body } = req;
      app.router.route({ url, method, headers, body }, res);
    };
  }

  if (app._core && typeof app._core._dispatch === 'function') {
    return app._core._dispatch({
      app
    });
  }

  throw new Error('Unsupported framework');
};
