# Advanced Options

`serverless-http` takes a second argument, `options`, which can configure:

## Request ID

- **requestId**: the header in which to place the AWS Request ID, defaults to `x-request-id` and can be disabled with `false`

```javascript
module.exports.handler = serverless(app, {
  requestId: 'X-ReqId',
});
```

## Base Path

- **basePath**: The base path/mount point for your serverless app. Useful if you want to have multiple Lambdas to represent
diffent portions of your application.

**BEFORE:**

```javascript
app.get('/new', (req, res) => {
  return res.send('woop');
});

module.exports.handler = serverless(app);
```

```bash
[GET] http://localhost/transactions/new -> 404 :'(
```

**AFTER:**

```javascript
app.get('/new', (req, res) => {
  return res.send('woop');
});
module.exports.handler = serverless(app, {
  basePath: '/transactions'
});
```

```bash
[GET] http://localhost/transactions/new -> 200 :+1:
```

**STAGE REMOVAL:**
BasePath will also remove pesky stage information from your URL, so the above example will also work with:

```bash
[GET] http://api-gateway.amazonaws.com/dev/v1/transactions/new -> 200!
```

## Transformations

- **request**: a *transform* for the request, before it is sent to the app
- **response**: a *transform* for the response, before it is returned to Lambda

A transform is either a function (req|res, event, context) or an Object to be assigned.

You can transform the request before it goes through your app.

You can transform the response after it comes back, before it is sent:

Some examples:

```javascript
module.exports.handler = serverless(app, {
  request: {
    key: 'value'
  },
  response(res) {
    res.foo = 'bar';
  }
})

module.exports.handler = serverless(app, {
  request(request, event, context) {
    request.context = event.requestContext;
  },
  async response(response, event, context) {
    // the return value is always ignored
    return new Promise(resolve => {
      // override a property of the response, this will affect the response
      response.statusCode = 420;

      // delay your responses by 300ms!
      setTimeout(300, () => {
        // this value has no effect on the response
        resolve('banana');
      });
    });
  }
})
```

## Binary Mode

Binary mode detection looks at the `BINARY_CONTENT_TYPES` environment variable, or you can specify an array of types, or a custom function:

```js
// turn off any attempt to base64 encode responses -- probably Not Going To Work At All
serverless(app, {
  binary: false
});

 // this is the default, look at content-encoding vs. gzip, deflate and content-type against process.env.BINARY_CONTENT_TYPES
serverless(app, {
  binary: true
});

// set the types yourself - just like BINARY_CONTENT_TYPES but using an array you pass in, rather than an environment varaible
serverless(app, {
  binary: ['application/json', 'image/*']
});

// your own custom callback
serverless(app, {
  binary(headers) {
    return ...
  }
});
```
