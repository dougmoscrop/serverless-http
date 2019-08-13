'use strict';

function getPath({ requestPath, path }) {
  if (requestPath) {
    return requestPath;
  }

  return typeof path === 'string' ? path : '/';
}

module.exports = function cleanupEvent(evt, options) {
  const event = evt || {};

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

  return event;
};
