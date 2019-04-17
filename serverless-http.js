'use strict';

const finish = require('./lib/finish');
const getFramework = require('./lib/framework/get-framework');
const getProvider = require('./lib/provider/get-provider');

const defaultOptions = {
  requestId: 'x-request-id'
};

module.exports = function (app, opts) {
  const options = Object.assign({}, defaultOptions, opts);

  const framework = getFramework(app);
  const provider = getProvider(options);

  return provider(async (request, ...context) => {
    await finish(request, options.request, ...context);
    const response = await framework(request);
    await finish(response, options.response, ...context);
    return response;
  });
};
