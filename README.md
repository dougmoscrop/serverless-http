# serverless-http

[![Build Status](https://travis-ci.org/dougmoscrop/serverless-http.svg?branch=master)](https://travis-ci.org/dougmoscrop/serverless-http)

## Binary Support

Starting with v1.5.0, `serverless-http` supports API Gateway binary modes. Binary support will base64 decode the incoming request body - when API Gateway specifies that it is encoded - and will base64 encode a response body if the `Content-Type` or `Content-Encoding` matches a known binary type/encoding. This means you can gzip your JSON or return a raw image, but it requires advanced configuration within API Gateway and is generally not fun to work with (consider yourself warned!)

Existing serverless-http APIs (i.e. those that return JSON as text) should not be affected. See advanced configuration documentation for details.

## Description

This module allows you to 'wrap' your API for serverless use. No HTTP server, no ports or sockets. Just your code in the same execution pipeline you are already familiar with.

Before using this module, you should already understand API Gateway and AWS Lambda. Specifically, you *must* be using Proxy Integration.

## Usage

You can use `express` (or `connect` or any `req, res` type middleware) instead of `koa` - it's all the same:

```javascript
const serverless = require('serverless-http');
const koa = require('koa');

// construct your app as normal
const app = koa();
// register your middleware as normal
app.use(/* ... */);

// this is it!
module.exports.handler = serverless(app);
```

If `handler` or `app` is `Promise` pattern, You can omit `callback`. - 
Example(is based `async/await`):
```javascript
const serverless = require('serverless-http');
const express = require('./express');

// construct your app as normal
const app = express();
// register your middleware as normal
app.use(/* ... */);

// this is it!
module.exports.handler = async (event, context) => serverless(app);
```
```javascript
const serverless = require('serverless-http');
const express = require('./express');

async function getApp() {
  // construct your app as normal
  const app = express();
  // register your middleware as normal
  app.use(/* ... */);
  return app;
}

// this is it!
module.exports.handler = async (event, context) => serverless(await getApp());
```



## Request/Response Transforms

You can transform the request before it goes through your app.

You can transform the response after it comes back, before it is sent:

```javascript
module.exports.handler = serverless(app, {
  request: function(request, event, context) {
    request.context = event.requestContext;
  },
  response: function(response, event, context) {
    // you can return promises, but the value of the promise is ignored
    return new Promise(resolve => {
      // override a property of the response, this will affect the response
      response.statusCode = 420;

      // delay your responses by 300ms!
      setTimeout(300, () => {
        resolve('banana'); // this value has no effect on the response
      });
    });
  }
})
```

## Limitations

Your code is still running in Lambda and API Gateway. This means you are still subject to the file size restrictions, for example. You also cannot rely on your server being 'up' in the sense that you can/should not use in-memory sessions, web sockets, etc.

>Think of this as a familiar way of expressing your API, *not* trying to make Lambda do something it cannot.

## Contributing

Pull requests are welcome! Especially test scenarios for different situations (e.g. multipart)

## Further Reading

Here are some [more detailed examples](./docs/EXAMPLES.md) and [advanced configuration options](./docs/ADVANCED.md)
