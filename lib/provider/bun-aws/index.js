// https://learnaws.io/blog/bun-aws-lambda

const cleanUpEvent = require('../aws/clean-up-event');

const createRequest = require('../aws/create-request');
const formatResponse = require('../aws/format-response');

module.exports = options => {
  return getResponse => async (event_, context = {}) => {
    const event = cleanUpEvent(event_.aws, options);

    const request = createRequest(event, context, options);
    const response = await getResponse(request, event, context);

    return formatResponse(event, response, options);
  };
};