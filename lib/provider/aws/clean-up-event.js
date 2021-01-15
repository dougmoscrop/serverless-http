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

function isString(value)
{
  return (typeof value === 'string' || value instanceof String);
}

// ELBs will pass spaces as + symbols, and decodeURIComponent doesn't decode + symbols. So we need to convert them into something it can convert
function specialDecodeURIComponent(value)
{
  if(!isString(value))
  {
    return value;
  }

  return decodeURIComponent(value.replace(/[+]/g, "%20"));
}

function recursiveURLDecode(value) {

  if (isString(value)) {
    return specialDecodeURIComponent(value);
  } else if (Array.isArray(value)) {

    const decodedArray = [];

    for (let index in value) {
      decodedArray.push(recursiveURLDecode(value[index]));
    }

    return decodedArray;

  } else if (value instanceof Object) {

    const decodedObject = {};

    for (let key of Object.keys(value)) {
      decodedObject[specialDecodeURIComponent(key)] = recursiveURLDecode(value[key]);
    }

    return decodedObject;
  }

  return value;
}

module.exports = function cleanupEvent(evt, options) {
  const event = evt || {};

  event.requestContext = event.requestContext || {};
  event.body = event.body || '';
  event.headers = event.headers || {};

  // Events coming from AWS Elastic Load Balancers do not automatically urldecode query parameters (unlike API Gateway). So we need to check for that and automatically decode them
  // to normalize the request between the two.
  if ('elb' in event.requestContext) {

    if (event.multiValueQueryStringParameters) {
      event.multiValueQueryStringParameters = recursiveURLDecode(event.multiValueQueryStringParameters);
    }

    if (event.queryStringParameters) {
      event.queryStringParameters = recursiveURLDecode(event.queryStringParameters);
    }

  }

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
