# serverless-http

Original (https://github.com/dougmoscrop/serverless-http). Just slightly modified to work with restify (http://restify.com/).

## modifications

- In (./lib/response.js), I renamed `_body` to `__body` to avoid conflicts with restify's response.
- In (./lib/get-body.js), I renamed `_body` to `__body` to be in sync with the rename in (./lib/response.js).