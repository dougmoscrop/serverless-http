'use strict';

function removeBasePath(path = '/', basePath) {
  if (basePath) {
    const basePathIndex = path.indexOf(basePath);

    if (basePathIndex > -1) {
      return path.substr(basePathIndex + basePath.length);
    }
  }

  return path;
}

module.exports = function cleanupEvent(evt, options) {
  const event = evt || {};

  event.requestContext = event.requestContext || {};
  event.body = event.body || '';
  event.headers = event.headers || {};

  if (event.version === '2.0') {
    event.requestContext.authorizer = event.requestContext.authorizer || {};
    event.requestContext.http.method = event.requestContext.http.method || 'GET';
    event.rawPath = removeBasePath(event.requestPath || event.rawPath, options.basePath);
  } else {
    event.requestContext.identity = event.requestContext.identity || {};
    event.httpMethod = event.httpMethod || 'GET';
    event.path = removeBasePath(event.requestPath || event.path, options.basePath);
  }

  return event;
};
