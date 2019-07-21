# Providers

## AWS

Before using this module, you should already understand API Gateway and AWS Lambda. Specifically, you *must* be using Proxy Integration.

### Binary Support

Starting with v1.5.0, `serverless-http` supports API Gateway binary modes. Binary support will base64 decode the incoming request body - when API Gateway specifies that it is encoded - and will base64 encode a response body if the `Content-Type` or `Content-Encoding` matches a known binary type/encoding. This means you can gzip your JSON or return a raw image, but it requires advanced configuration within API Gateway and is generally not fun to work with (consider yourself warned!)

Existing serverless-http APIs (i.e. those that return JSON as text) should not be affected. See advanced configuration documentation for details.

### Logging

With logging, API Gateway requests and responses can be viewed by CloudWatch, most notably by CloudWatch Logs Insights. Use carefully and preferably only in development mode because too much logs can be generated and incur additional costs.

```js
// enable logging for event, context e response to the CloudWatch
serverless(app, {
  verbose: true
});
```