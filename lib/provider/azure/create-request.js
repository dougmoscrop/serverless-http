'use strict';

const url = require('url');

const Request = require('../../request');

function requestHeaders(request) {
    return Object.keys(request.headers).reduce((headers, key) => {
        headers[key.toLowerCase()] = request.headers[key];
        return headers;
    }, {});
}

function requestBody(request) {
    const type = typeof request.body;

    if (Buffer.isBuffer(request.body)) {
        return request.body;
    } else if (type === 'string') {
        return Buffer.from(request.body, 'utf8');
    } else if (type === 'object') {
        return Buffer.from(JSON.stringify(request.body));
    }

    throw new Error(`Unexpected request.body type: ${typeof request.body}`);
}

module.exports = (request, options) => {
    const method = request.method;
    const query = request.query;
    const headers = requestHeaders(request);
    const body = requestBody(request);

    if (typeof options.requestId === 'string' && options.requestId.length > 0) {
        const header = options.requestId.toLowerCase();
        headers[header] = headers[header] || event.requestContext.requestId;
    }

    const req = new Request({
        method,
        headers,
        body,
        url: url.format({
            pathname: request.url,
            query
        })
    });
    req.requestContext = request.requestContext;
    return req;
}