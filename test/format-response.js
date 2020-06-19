'use strict';

const formatResponse = require('../lib/provider/aws/format-response');
const Response = require('../lib/response');
const expect = require('chai').expect;

describe('format-response', function () {
  
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

  it('throws on chunked transfer-encoding on v1Event', () => {
    const response = new Response({});
    response.setHeader('transfer-encoding', 'chunked');
    expect(() => formatResponse(v1Event, response, {})).to.throw(Error, 'chunked encoding not supported');
  });

  it('throws on res.chunkedEncoding on v1Event', () => {
    const response = new Response({});
    response.chunkedEncoding = true;

    expect(() => formatResponse(v1Event, response, {})).to.throw(Error, 'chunked encoding not supported');
  });

  it("throws on chunked transfer-encoding on v2Event", () => {
    const response = new Response({});
    response.setHeader("transfer-encoding", "chunked");
    expect(() => formatResponse(v2Event, response, {})).to.throw(
      Error,
      "chunked encoding not supported"
    );
  });

  it("throws on res.chunkedEncoding on v2Event", () => {
    const response = new Response({});
    response.chunkedEncoding = true;

    expect(() => formatResponse(v2Event, response, {})).to.throw(
      Error,
      "chunked encoding not supported"
    );
  });

  it("v2Event: return object contains cookies", () => {
    const response = new Response({});
    response.headers['set-cookie'] = ['foo=bar', 'hail=hydra'];

    expect(formatResponse(v2Event, response, {}).cookies).to.exist;
  });

  it("v2Event: cookies in return object is an array", () => {
    const response = new Response({});
    response.headers["set-cookie"] = ["foo=bar", "hail=hydra"];

    expect(Array.isArray(formatResponse(v2Event, response, {}).cookies)).to.be.true;
  });

  it("v1Event: return object contains multiValueHeaders", () => {
    const response = new Response({});
    response.headers["set-cookie"] = ["foo=bar", "hail=hydra"];

    expect(formatResponse(v1Event, response, {}).multiValueHeaders).to.exist;
  });

  it("v1Event: multiValueHeaders in return object is an object with value of each header an array", () => {
    const response = new Response({});
    response.headers["set-cookie"] = ["foo=bar", "hail=hydra"];

    expect(Array.isArray(formatResponse(v1Event, response, {}).multiValueHeaders['set-cookie'])).to.be
      .true;
  });

});
