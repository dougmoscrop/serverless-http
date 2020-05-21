const cleanupRequest = require('./clean-up-request');
const createRequest = require('./create-request');
const formatResponse = require('./format-response');

module.exports = options => {
    return getResponse => async (context, req) => {
        const event = cleanupRequest(req, options);
        const request = createRequest(event, options);
        const response = await getResponse(request, context, event);
        context.log(response);
        return formatResponse(response, options);
    }
};