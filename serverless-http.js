'use strict';

const getHandler = require('./lib/get-handler');

const defaultOptions = {
  requestId: 'x-request-id'
};

module.exports = function (app, opts = {}) {
  const options = Object.assign({}, defaultOptions, opts);
  const handler = getHandler(app, options);

  return async (event, context = {}) => {
    return handler(event, context);
  };
};
