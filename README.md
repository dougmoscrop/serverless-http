# serverless-http

[![Build Status](https://travis-ci.org/dougmoscrop/serverless-http.svg?branch=master)](https://travis-ci.org/dougmoscrop/serverless-http)

## Description

This module allows you to 'wrap' your API for serverless use. No HTTP server, no ports or sockets. Just your code in the same execution pipeline you are already familiar with.

## Sponsors

Thank you to Upstash for reaching out to sponsor this project!

<table>
<tr>
<td>
  <img width="1000" height="0">
  <a href="https://upstash.com/?utm_source=serverless-http" >
  <img src="https://raw.githubusercontent.com/upstash/sponsorship/master/redis.png" alt="Upstash" width="260" align="right">
  </a>
<h3>Upstash: Serverless Database for Redis</h3>

  <ul>
    <li>Serverless Redis with global replication and durable storage</li>
    <li>Price scales to zero with per request pricing</li>
    <li>Built-in REST API designed for serverless and edge functions</li>
  </ul>
  
[Start for free in 30 seconds!](https://upstash.com/?utm_source=serverless-http)
</td>
</tr>
</table>

## Support

### Supported Frameworks
(* Experimental)

* Node (http.createServer)
* Connect
* Express
* Koa
* Restana
* Sails *
* Hapi *
* Fastify *
* Restify *
* Polka *
* Loopback *

### Supported Providers

* AWS
* Azure (Experimental, untested, probably outdated)

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

### Usage example using the Express framework with Azure

```javascript

const serverless = require('serverless-http');
const express = require('express');

const app = express();

app.use(/* register your middleware as normal */);

const handler = serverless(app, { provider: 'azure' });
module.exports.funcName = async (context, req) => {
  context.res = await handler(context, req);
}

```

### Other examples
[json-server-less-λ](https://github.com/pharindoko/json-server-less-lambda) - using serverless-http with json-server and serverless framework in AWS


## Limitations

Your code is running in a serverless environment. You cannot rely on your server being 'up' in the sense that you can/should not use in-memory sessions, web sockets, etc. You are also subject to provider specific restrictions on request/response size, duration, etc.

> Think of this as a familiar way of expressing your app logic, *not* trying to make serverless do something it cannot.

## Contributing

Pull requests are welcome! Especially test scenarios for different situations and configurations.

## Further Reading

Here are some [more detailed examples](./docs/EXAMPLES.md) and [advanced configuration options](./docs/ADVANCED.md) as well as [provider-specific documentation](./docs/PROVIDERS.md)

