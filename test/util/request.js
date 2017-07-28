'use strict';

const serverless = require('../../serverless-http');

module.exports = function(app, request) {
  if (process.env.INTEGRATION_TEST) {
    throw new Error();
  }

  const handler = serverless(app);

  return new Promise((resolve, reject) => {
    handler(request, {}, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};
