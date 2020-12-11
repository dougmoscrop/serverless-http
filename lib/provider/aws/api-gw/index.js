const cleanUpEvent = require('./clean-up-event');

const createRequest = require('./create-request');
const formatResponse = require('./format-response');

module.exports = options => {
  return getResponse => async (event_, context = {}) => {
    const event = cleanUpEvent(event_, options);

    const request = createRequest(event, options);
    const response = await getResponse(request, event, context);

    return formatResponse(event, response, options);
  };
};
