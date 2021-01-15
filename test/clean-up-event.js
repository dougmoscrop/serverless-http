'use strict';

const cleanUpEvent = require('../lib/provider/aws/clean-up-event.js');
const expect = require('chai').expect;

describe('clean up event', () => {
  it('should clean up api gateway payload format version 1.0 correctly', () => {
    // Construct dummy v1 event
    const v1Event = {
      version: '1.0',
      resource: '/my/path',
      path: '/my/path',
      httpMethod: 'GET',
      headers: {
        'Header1': 'value1',
        'Header2': 'value2'
      },
      queryStringParameters: { parameter1: 'value1', parameter2: 'value' },
      multiValueQueryStringParameters: { parameter1: ['value1', 'value2'], paramter2: ['value'] },
      requestContext: {
        accountId: '123456789012',
        apiId: 'id',
        authorizer: { claims: null, scopes: null },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        extendedRequestId: 'request-id',
        httpMethod: 'GET',
        path: '/my/path',
        protocol: 'HTTP/1.1',
        requestId: 'id=',
        requestTime: '04/Mar/2020:19:15:17 +0000',
        requestTimeEpoch: 1583349317135,
        resourceId: null,
        resourcePath: '/my/path',
        stage: '$default'
      },
      pathParameters: null,
      stageVariables: null,
      body: 'Hello from Lambda!',
      isBase64Encoded: true
    };

    // Clean the event
    cleanUpEvent(v1Event, { basePath: '/my' });

    expect(v1Event).to.eql({
      version: '1.0',
      resource: '/my/path',
      path: '/path',
      httpMethod: 'GET',
      headers: { Header1: 'value1', Header2: 'value2' },
      queryStringParameters: { parameter1: 'value1', parameter2: 'value' },
      multiValueQueryStringParameters: { parameter1: ['value1', 'value2'], paramter2: ['value'] },
      requestContext: {
        accountId: '123456789012',
        apiId: 'id',
        authorizer: { claims: null, scopes: null },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        extendedRequestId: 'request-id',
        httpMethod: 'GET',
        path: '/my/path',
        protocol: 'HTTP/1.1',
        requestId: 'id=',
        requestTime: '04/Mar/2020:19:15:17 +0000',
        requestTimeEpoch: 1583349317135,
        resourceId: null,
        resourcePath: '/my/path',
        stage: '$default',
        identity: {}
      },
      pathParameters: null,
      stageVariables: null,
      body: 'Hello from Lambda!',
      isBase64Encoded: true
    });
  });

  it('should clean up api gateway payload format version 2.0 correctly', () => {
    // Construct dummy v2 event
    const v2Event = {
      version: '2.0',
      routeKey: '$default',
      rawPath: '/my/path',
      rawQueryString: 'parameter1=value1&parameter1=value2&parameter2=value',
      cookies: ['cookie1', 'cookie2'],
      headers: {
        'Header1': 'value1',
        'Header2': 'value2'
      },
      queryStringParameters: { parameter1: 'value1,value2', parameter2: 'value' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        authorizer: {
          jwt: {
            claims: { 'claim1': 'value1', 'claim2': 'value2' },
            scopes: ['scope1', 'scope2']
          }
        },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'POST',
          path: '/my/path',
          protocol: 'HTTP/1.1',
          sourceIp: 'IP',
          userAgent: 'agent'
        },
        requestId: 'id',
        routeKey: '$default',
        stage: '$default',
        time: '12/Mar/2020:19:03:58 +0000',
        timeEpoch: 1583348638390
      },
      body: 'Hello from Lambda',
      pathParameters: { 'parameter1': 'value1' },
      isBase64Encoded: false,
      stageVariables: { 'stageVariable1': 'value1', 'stageVariable2': 'value2' }
    };

    // Clean the event
    cleanUpEvent(v2Event, { basePath: '/my' });

    expect(v2Event).to.eql({
      version: '2.0',
      routeKey: '$default',
      rawPath: '/path',
      rawQueryString: 'parameter1=value1&parameter1=value2&parameter2=value',
      cookies: ['cookie1', 'cookie2'],
      headers: { Header1: 'value1', Header2: 'value2' },
      queryStringParameters: { parameter1: 'value1,value2', parameter2: 'value' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        authorizer: {
          jwt: {
            claims: { 'claim1': 'value1', 'claim2': 'value2' },
            scopes: ['scope1', 'scope2']
          }
        },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'POST',
          path: '/my/path',
          protocol: 'HTTP/1.1',
          sourceIp: 'IP',
          userAgent: 'agent'
        },
        requestId: 'id',
        routeKey: '$default',
        stage: '$default',
        time: '12/Mar/2020:19:03:58 +0000',
        timeEpoch: 1583348638390
      },
      body: 'Hello from Lambda',
      pathParameters: { parameter1: 'value1' },
      isBase64Encoded: false,
      stageVariables: { stageVariable1: 'value1', stageVariable2: 'value2' }
    });

  });

  it('should properly urldecode ELB payload query params', () => {
    // Construct dummy v2 event
    const v2Event = {
      version: '2.0',
      routeKey: '$default',
      rawPath: '/my/path',
      rawQueryString: 'parameter%231=value%231&parameter%231=value%232&parameter2=value&parameter3=hello+world',
      cookies: ['cookie1', 'cookie2'],
      headers: {
        'Header1': 'value1',
        'Header2': 'value2'
      },
      queryStringParameters: { 'parameter%231': 'value%231,value%232', 'parameter2': 'value', 'parameter3': 'hello+world' },
      multiValueQueryStringParameters: { 'parameter%231': ['value%231', 'value%232'], 'parameter2': ['value'], 'parameter3': ['hello+world'] },
      requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        authorizer: {
          jwt: {
            claims: { 'claim1': 'value1', 'claim2': 'value2' },
            scopes: ['scope1', 'scope2']
          }
        },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'POST',
          path: '/my/path',
          protocol: 'HTTP/1.1',
          sourceIp: 'IP',
          userAgent: 'agent'
        },
        requestId: 'id',
        routeKey: '$default',
        stage: '$default',
        time: '12/Mar/2020:19:03:58 +0000',
        timeEpoch: 1583348638390,
        elb: {
          targetGroupArn: "arn:aws:elasticloadbalancing:region:123456789012:targetgroup/my-target-group/6d0ecf831eec9f09"
        }
      },
      body: 'Hello from Lambda',
      pathParameters: { 'parameter1': 'value1' },
      isBase64Encoded: false,
      stageVariables: { 'stageVariable1': 'value1', 'stageVariable2': 'value2' }
    };

    // Clean the event
    cleanUpEvent(v2Event, { basePath: '/my' });

    expect(v2Event).to.eql({
      version: '2.0',
      routeKey: '$default',
      rawPath: '/path',
      rawQueryString: 'parameter%231=value%231&parameter%231=value%232&parameter2=value&parameter3=hello+world',
      cookies: ['cookie1', 'cookie2'],
      headers: { Header1: 'value1', Header2: 'value2' },
      queryStringParameters: { 'parameter#1': 'value#1,value#2', 'parameter2': 'value', 'parameter3': 'hello world' },
      multiValueQueryStringParameters: { 'parameter#1': ['value#1', 'value#2'], 'parameter2': ['value'], 'parameter3': ['hello world'] },
      requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        authorizer: {
          jwt: {
            claims: { 'claim1': 'value1', 'claim2': 'value2' },
            scopes: ['scope1', 'scope2']
          }
        },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'POST',
          path: '/my/path',
          protocol: 'HTTP/1.1',
          sourceIp: 'IP',
          userAgent: 'agent'
        },
        requestId: 'id',
        routeKey: '$default',
        stage: '$default',
        time: '12/Mar/2020:19:03:58 +0000',
        timeEpoch: 1583348638390,
        elb: {
          targetGroupArn: "arn:aws:elasticloadbalancing:region:123456789012:targetgroup/my-target-group/6d0ecf831eec9f09"
        }
      },
      body: 'Hello from Lambda',
      pathParameters: { parameter1: 'value1' },
      isBase64Encoded: false,
      stageVariables: { stageVariable1: 'value1', stageVariable2: 'value2' }
    });

  });

  it('should not urldecode query params for non ELB payloads', () => {
    // Construct dummy v2 event
    const v2Event = {
      version: '2.0',
      routeKey: '$default',
      rawPath: '/my/path',
      rawQueryString: 'parameter%231=value%231&parameter%231=value%232&parameter2=value',
      cookies: ['cookie1', 'cookie2'],
      headers: {
        'Header1': 'value1',
        'Header2': 'value2'
      },
      queryStringParameters: { 'parameter%231': 'value%231,value%232', 'parameter2': 'value' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        authorizer: {
          jwt: {
            claims: { 'claim1': 'value1', 'claim2': 'value2' },
            scopes: ['scope1', 'scope2']
          }
        },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'POST',
          path: '/my/path',
          protocol: 'HTTP/1.1',
          sourceIp: 'IP',
          userAgent: 'agent'
        },
        requestId: 'id',
        routeKey: '$default',
        stage: '$default',
        time: '12/Mar/2020:19:03:58 +0000',
        timeEpoch: 1583348638390
      },
      body: 'Hello from Lambda',
      pathParameters: { 'parameter1': 'value1' },
      isBase64Encoded: false,
      stageVariables: { 'stageVariable1': 'value1', 'stageVariable2': 'value2' }
    };

    // Clean the event
    cleanUpEvent(v2Event, { basePath: '/my' });

    expect(v2Event).to.eql({
      version: '2.0',
      routeKey: '$default',
      rawPath: '/path',
      rawQueryString: 'parameter%231=value%231&parameter%231=value%232&parameter2=value',
      cookies: ['cookie1', 'cookie2'],
      headers: { Header1: 'value1', Header2: 'value2' },
      queryStringParameters: { 'parameter%231': 'value%231,value%232', 'parameter2': 'value' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        authorizer: {
          jwt: {
            claims: { 'claim1': 'value1', 'claim2': 'value2' },
            scopes: ['scope1', 'scope2']
          }
        },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'POST',
          path: '/my/path',
          protocol: 'HTTP/1.1',
          sourceIp: 'IP',
          userAgent: 'agent'
        },
        requestId: 'id',
        routeKey: '$default',
        stage: '$default',
        time: '12/Mar/2020:19:03:58 +0000',
        timeEpoch: 1583348638390
      },
      body: 'Hello from Lambda',
      pathParameters: { parameter1: 'value1' },
      isBase64Encoded: false,
      stageVariables: { stageVariable1: 'value1', stageVariable2: 'value2' }
    });

  });
});
