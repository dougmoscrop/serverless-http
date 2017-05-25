## Test

# serverless-http

[![Build Status](https://travis-ci.org/dougmoscrop/serverless-http.svg?branch=master)](https://travis-ci.org/dougmoscrop/serverless-http)

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

## Limitations

Your code is still running in Lambda and API Gateway. This means you are still subject to the file size restrictions, for example. You also cannot rely on your server being 'up' in the sense that you can/should not use in-memory sessions, web sockets, etc.

>Think of this as a familiar way of expressing your API, *not* trying to make Lambda do something it cannot.

## Contributing

Pull requests are welcome! Especially test scenarios for different situations (e.g. multipart)

## Further Reading

Here are some [more detailed examples](./docs/EXAMPLES.md) and [advanced configuration options](./docs/ADVANCED.md)
