'use strict';

module.exports.true = function(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = true;
  callback({
    statusCode: 202
  });
};

module.exports.false = function(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  callback({
    statusCode: 202
  });
};
