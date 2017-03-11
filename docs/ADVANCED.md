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
