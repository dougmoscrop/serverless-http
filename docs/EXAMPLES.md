# Examples

## Note: AWS

`serverless-http` relies on AWS Lambda Proxy Integration and you can use wildcards in the path binding to delegate routing logic to your application rather than API Gateway.

The examples below are using the serverless framework (serverless.yml) but the path rules you see would be the same if you set it up manually in the AWS console or via CloudFormation, etc.

## All in one

With this example, the entire API is served by one Lambda function (with two 'events' triggering it - see comments inline)

```yml
service: hello-world

provider:
  name: aws
  runtime: nodejs4.3

functions:
  api:
    handler: src/server.handler
    events:
      - http:
          path: / # this matches the base path
          method: ANY
      - http:
          path: /{any+} # this matches any path, the token 'any' doesn't mean anything special
          method: ANY
```

## Multiple functions/resources

You do not have to put everything in one function. In the below example there are two separate functions handling two different resources, `/foo` and `/bar` respectively. In this example, `/bar` does not have a second wildcard handler, so ONLY to exact path `/bar` would match. However, `/foo` does have a wildcard so a sub-resource such as `/foo/baz/123` would go to the `foo_api` handler.

```yml
service: hello-world

provider:
  name: aws
  runtime: nodejs4.3

functions:
  foo_api:
    handler: src/foo.handler
    events:
      - http:
          path: /foo # this matches the base path
          method: ANY
      - http:
          path: /foo/{any+} # this matches any path, the token 'any' doesn't mean anything special
          method: ANY
  bar_api:
    handler: src/bar.handler
    events:
      - http:
          path: /bar # this matches the base path only
          method: ANY
```
