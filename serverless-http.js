'use strict';

const getHandler = require('./lib/get-handler');
const dispatch = require('./lib/dispatch');

const defaultOptions = {
  requestId: 'x-request-id'
};

module.exports = function (app, opts = {}) {
  const options = Object.assign({}, defaultOptions, opts);
  const waitForEmpty = !!options.callbackWaitsForEmptyEventLoop;

  const handler = getHandler(app, options);

  return (event, context = {}, callback) => {
    context.callbackWaitsForEmptyEventLoop = waitForEmpty;

    const promise = handler(event, context);

    return dispatch(promise, callback);
  };
};
