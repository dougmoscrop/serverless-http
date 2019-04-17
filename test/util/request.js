'use strict';

const serverless = require('../../serverless-http');

module.exports = async function(app, request, options) {
  if (process.env.INTEGRATION_TEST) {
    throw new Error();
  }

  const handler = serverless(app, options);

  return await handler(request);
};
