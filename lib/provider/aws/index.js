const apiGw = require('./api-gw');
const lambdaEdgeOriginRequest = require('./lambda-edge-origin-request');

module.exports = options => {
  if (options.type === 'lambda-edge-origin-request') {
    return lambdaEdgeOriginRequest(options)
  } else {
    return apiGw(options)
  }
};
