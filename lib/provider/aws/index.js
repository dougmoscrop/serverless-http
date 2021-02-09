const apiGw = require('./api-gw');
const lambdaEdgeOriginRequest = require('./lambda-edge-origin-request');

module.exports = options => {
  switch (options.type) {
    case 'lambda-edge-origin-request':
      return lambdaEdgeOriginRequest(options)
    default:
      return apiGw(options)
  }
};
