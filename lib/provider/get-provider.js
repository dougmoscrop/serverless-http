const aws = require('./aws');
const azure = require('./azure');
const bunAws = require('./bun-aws');

const providers = {
  aws,
  azure,
  bunAws,
};

module.exports = function getProvider(options) {
  const { provider = 'aws' } = options;

  if (provider in providers) {
    return providers[provider](options);
  }

  throw new Error(`Unsupported provider ${provider}`);
};
