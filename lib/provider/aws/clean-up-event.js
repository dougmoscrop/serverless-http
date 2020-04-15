'use strict';

function getPath({ requestPath, path, rawPath }) {
  if (requestPath) {
    return requestPath;
  }

  // Payload 2.0
  if (rawPath) {
    return typeof rawPath === 'string' ? rawPath : '/';
  }

  return typeof path === 'string' ? path : '/';
}

module.exports = function cleanupEvent(evt, options) {
  const event = evt || {};

  if (!evt || !evt.version || evt.version === '1.0') {
    event.requestContext = event.requestContext || {};
    event.requestContext.identity = event.requestContext.identity || {};
    event.httpMethod = event.httpMethod || 'GET';
    event.path = getPath(event);
    event.body = event.body || '';
    event.headers = event.headers || {};

    if (options.basePath) {
      const basePathIndex = event.path.indexOf(options.basePath);

      if (basePathIndex > -1) {
        event.path = event.path.substr(basePathIndex + options.basePath.length);
      }
    }

  } else if (evt.version === '2.0') {
    event.requestContext = event.requestContext || {};
    event.requestContext.authorizer = event.requestContext.authorizer || {};
    event.requestContext.http.method = event.requestContext.http.method || 'GET';
    event.rawPath = getPath(event);
    event.body = event.body || '';
    event.headers = event.headers || {};

    if (options.basePath) {
      const basePathIndex = event.rawPath.indexOf(options.basePath);

      if (basePathIndex > -1) {
        event.rawPath = event.rawPath.substr(basePathIndex + options.basePath.length);
      }
    }
  }

  return event;
};
