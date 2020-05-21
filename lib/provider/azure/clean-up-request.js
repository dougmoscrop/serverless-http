'use strict';

function getUrl({ requestPath, url }) {
    if (requestPath) {
        return requestPath;
    }

    return typeof url === 'string' ? url : '/';
}

function getRequestContext(request) {
    const requestContext = {};
    requestContext.identity = {};
    const forwardedIp = request.headers['x-forwarded-for'];
    const clientIp = request.headers['client-ip'];
    const ip = forwardedIp ? forwardedIp : (clientIp ? clientIp : '');
    if (ip) {
        requestContext.identity.sourceIp = ip.split(':')[0];
    }
    return requestContext;
}

module.exports = function cleanupRequest(req, options) {
    const request = req || {};

    request.requestContext = getRequestContext(req);
    request.method = request.method || 'GET';
    request.url = getUrl(request);
    request.body = request.body || '';
    request.headers = request.headers || {};

    if (options.basePath) {
        const basePathIndex = request.url.indexOf(options.basePath);

        if (basePathIndex > -1) {
            request.url = request.url.substr(basePathIndex + options.basePath.length);
        }
    }

    return request;
}