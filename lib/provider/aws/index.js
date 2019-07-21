const cleanUpEvent = require('./clean-up-event');

const createRequest = require('./create-request');
const formatResponse = require('./format-response');

const TRIM_LOG_BODY_LENGTH = 1024;

module.exports = options => {
  return getResponse => async (event_, context = {}) => {
    const event = cleanUpEvent(event_);

    if (options.verbose) {
      console.log(JSON.stringify({ event }, null, 2));
      console.log(JSON.stringify({ context }, null, 2));
    }

    const request = createRequest(event, options);
    const response = await getResponse(request, event, context);

    const res = formatResponse(response, options);

    if (options.verbose) {
      console.log(JSON.stringify({ response: Object.assign({}, res, {
        body: res.body && res.body.length > TRIM_LOG_BODY_LENGTH ? res.body.substr(0, TRIM_LOG_BODY_LENGTH) + '...' : res.body,
      }) }, null, 2));
    }

    return res;
  };
};
