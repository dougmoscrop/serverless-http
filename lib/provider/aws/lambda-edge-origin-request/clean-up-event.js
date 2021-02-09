'use strict';

function removeBasePath(path = '/', basePath) {
  if (basePath) {
    const basePathIndex = path.indexOf(basePath);

    if (basePathIndex > -1) {
      return path.substr(basePathIndex + basePath.length) || '/';
    }
  }

  return path;
}

module.exports = function cleanupEvent(evt, options) {
  const event = evt || {};

  event.config = event.config || {};

  event.request = event.request || {};
  event.request.body = event.request.body || {};
  event.request.headers = event.request.headers || {};
  event.request.method = event.request.method || 'GET';
  console.debug(`url is ${event.request.uri} basePath is ${options.basePath}`);
  event.request.uri = removeBasePath(event.uri, options.basePath);

  return event;
};
