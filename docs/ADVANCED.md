# Advanced Options

`serverless-http` takes a second argument, `options`, which can contain:

- **requestId**: the header in which to place the AWS Request ID, defaults to `x-request-id` and can be disabled with `false`
- **request**: a *transform* for the request, before it is sent to the app
- **response**: a *transform* for the response, before it is returned to Lambda

A transform is either a function (req|res, event, context) or an Object to be assigned.

Here is an example:

```javascript
module.exports.handler = serverless(app, {
  requestId: 'X-ReqId',
  request: {
    key: 'value'
  },
  response: function(res) {
    return Promise.resolve()
      .then(() => {
        res.foo = 'bar';
      });
  }
})
```

### Binary Mode

Binary mode detection looks at the BINARY_CONTENT_TYPES environment variable, or you can specify an array of types, or a custom function:

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
  binary: function(headers) {
    return ...
  }
});
```
