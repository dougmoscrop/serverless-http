# serverless-http

[![Build Status](https://travis-ci.org/dougmoscrop/serverless-http.svg?branch=master)](https://travis-ci.org/dougmoscrop/serverless-http)

## 2.0

The 2.0 release moves to async/await and requires Node 8+.

All frameworks have been updated to their latest versions.

## Description

This module allows you to 'wrap' your API for serverless use. No HTTP server, no ports or sockets. Just your code in the same execution pipeline you are already familiar with.

## Support

### Supported Frameworks
(* Experimental)

* Connect
* Express
* Koa
* Restana *
* Sails *
* Hapi *
* Fastify *
* Restify *
* Polka *
* Loopback *

### Supported Providers

* AWS

## Examples

Please check the `examples` folder!

### Usage example using the Koa framework

```javascript
const serverless = require('serverless-http');
const Koa = require('koa'); // or any supported framework

const app = new Koa();

app.use(/* register your middleware as normal */);

// this is it!
module.exports.handler = serverless(app);

// or as a promise
const handler = serverless(app);
module.exports.handler = async (event, context) => {
  // you can do other things here
  const result = await handler(event, context);
  // and here
  return result;
};
```

### Other examples
[json-server-less-λ](https://github.com/pharindoko/json-server-less-lambda) - using serverless-http with json-server and serverless framework in AWS

## Limitations

Your code is running in a serverless environment. You cannot rely on your server being 'up' in the sense that you can/should not use in-memory sessions, web sockets, etc. You are also subject to provider specific restrictions on request/response size, duration, etc.

> Think of this as a familiar way of expressing your app logic, *not* trying to make serverless do something it cannot.

## Compatibility

To help prevent serverless-http interfering with other libraries some features need to be configured manually.

Path parameters can cause conflicts due to many routing libraries using `req.params` for storing path parameters, if you are using
[proxy+ integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html)
then you may want access to the object from AWS, however you need to prevent conflicts with your in-app router.

Application level routers tend to override the `req.params` key, so by enabling the following option serverless-http will
bind it to `req.pathParameters` instead so that it can still be accessed manually.

```js
const handler = serverless(app, { bindParams: true });
```

## Contributing

Pull requests are welcome! Especially test scenarios for different situations and configurations.

## Further Reading

Here are some [more detailed examples](./docs/EXAMPLES.md) and [advanced configuration options](./docs/ADVANCED.md) as well as [provider-specific documentation](./docs/PROVIDERS.md)
