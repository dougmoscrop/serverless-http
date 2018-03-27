'use strict';

module.exports = function cleanupEvent(evt) {
  const event = evt || {};
  const rc = event.requestContext || {};

  const requestContext = Object.create(rc, {
    path: {
      value: rc.path || '/'
    },
    identity: {
      value: rc.identity || {}
    }
  });

  return Object.create(event, {
    httpMethod: {
      value: event.httpMethod || 'GET'
    },
    body: {
      value: event.body || '',
    },
    headers: {
      value: event.headers || {},
    },
    requestContext: {
      value: requestContext
    }
  });
};
