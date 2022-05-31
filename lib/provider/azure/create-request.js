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
    const type = typeof request.rawBody;

    if (Buffer.isBuffer(request.rawBody)) {
        return request.rawBody;
    } else if (type === 'string') {
        return Buffer.from(request.rawBody, 'utf8');
    } else if (type === 'object') {
        return Buffer.from(JSON.stringify(request.rawBody));
    }

    throw new Error(`Unexpected request.body type: ${typeof request.rawBody}`);
}

module.exports = (request) => {
    const method = request.method;
    const query = request.query;
    const headers = requestHeaders(request);
    const body = requestBody(request);

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
