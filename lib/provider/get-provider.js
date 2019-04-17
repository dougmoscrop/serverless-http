const aws = require('./aws');

const providers = {
  aws
};

module.exports = function getProvider(options) {
  const { provider = 'aws' } = options;

  if (provider in providers) {
    return providers[provider](options);
  }

  throw new Error(`Unsupported provider ${provider}`);
};
