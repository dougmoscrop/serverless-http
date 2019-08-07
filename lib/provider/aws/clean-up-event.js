'use strict';

module.exports = function cleanupEvent(evt, options) {
  const event = evt || {};

  event.httpMethod = event.httpMethod || 'GET';
  event.path = event.path || '/';
  event.body = event.body || '';
  event.headers = event.headers || {};
  event.requestContext = event.requestContext || {};
  event.requestContext.path = event.requestContext.path || event.path;
  event.requestContext.identity = event.requestContext.identity || {};

  if (options.basePath) {
    const basePathIndex = event.path.indexOf(options.basePath);

    if (basePathIndex === -1) {
      return;
    }

    if (basePathIndex === 0) {
      event.path = event.path.replace(options.basePath, '');
    } else {
      event.path = event.path.substr(-(basePathIndex + 1));
    }

  }

  return event;
};
