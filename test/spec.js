'use strict';

const getStream = require('get-stream');
const onHeaders = require('on-headers');
const onFinished = require('on-finished');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect } = chai;

const serverless = require('../serverless-http');

describe('spec', () => {
  it('should throw when a non express/koa style object is passed', () => {
    expect(() => serverless({})).to.throw(Error);
  });

  it('should set a default event', async () => {
    let request;

    const handler = serverless((req, res) => {
      request = req;
      res.end('');
    });

    await expect(handler(null)).to.be.fulfilled;
    expect(request).to.be.an('Object');
  });

  it('should trigger on-headers for res', async () => {
    let called = false;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = true;
      });
      res.end('');
    });

    await expect(handler(null)).to.be.fulfilled;
    expect(called).to.be.true;
  });

  it('should trigger on-finished for res', async () => {
    return new Promise(resolve => {
      const handler = serverless((req, res) => {
        onFinished(res, () => {
          resolve();
        });
        res.end('');
      });

      handler(null);
    });
  });

  it('should trigger on-finished for req', async () => {
    let called = false;
    const handler = serverless((req, res) => {
      onFinished(req, () => {
        called = true;
        res.end('');
      });
    });

    await expect(handler(null)).to.be.fulfilled;
    expect(called).to.be.true;
  });

  it('should set default requestId', async () => {
    let called;

    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    });

    await handler({ requestContext: { requestId: 'foo' } });
    expect(!!called).to.be.true;
    expect(called.headers['x-request-id']).to.eql('foo');
  });

  it('should set custom requestId', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: 'Custom-Request-ID' });

    await handler({ requestContext: { requestId: 'bar' } });
    expect(!!called).to.be.true;
    expect(called.headers['custom-request-id']).to.eql('bar');
  });

  it('should use requestPath when available', async () => {
    let url;
    const handler = serverless((req, res) => {
      url = req.url;
      res.end('');
    });

    await handler({ requestPath: '/different', requestContext: { requestId: 'bar' } });
    expect(url).to.deep.equal('/different');
  });

  it('should keep existing requestId', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: 'Custom-Request-ID' });

    await handler({ headers: { 'custom-request-id': 'abc' }, requestContext: { requestId: 'bar' } });
    expect(!!called).to.be.true;
    expect(called.headers['custom-request-id']).to.eql('abc');
  });

  it('should not set request id when disabled', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    }, { requestId: false });

    await handler({ requestContext: { requestId: 'bar' } });
    expect(!!called).to.be.true;
    expect(called.headers['x-request-id']).to.be.undefined;
  });

  it('should set request context on request', async () => {
    let called;
    const handler = serverless((req, res) => {
      onHeaders(res, () => {
        called = req;
      });
      res.end('');
    });
    const requestContext = {};
    await handler({ requestContext });
    expect(!!called).to.be.true;
    expect(called.requestContext).to.equal(requestContext);
  });

  it('should support transforming the request', async () => {
    let request;
    const event = {}
    const context = {}

    const handler = serverless((req, res) => {
      request = req;
      res.end('');
    }, {
        request: (req, evt, ctx) => {
          req.event = evt;
          req.context = ctx;
        }
      });

    await handler(event, context);
    expect(request.event).to.equal(event);
    expect(request.context).to.equal(context);
  });

  it('should transform different payload format requests the same', async () => {
    let requestV1;
    let requestV2;
    const context = {}

    const handler1 = serverless((req, res) => {
      requestV1 = req;
      res.end('');
    }, {
        request: (req, evt, ctx) => {
          req.event = evt;
          req.context = ctx;
        }
      });

    const handler2 = serverless((req, res) => {
      requestV2 = req;
      res.end('');
    }, {
        request: (req, evt, ctx) => {
          req.event = evt;
          req.context = ctx;
        }
      });

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
      multiValueQueryStringParameters: { parameter1: ['value1', 'value2'], parameter2: ['value'] },
      requestContext: {
        accountId: '123456789012',
        apiId: 'id',
        authorizer: {
          jwt: {
            claims: { 'claim1': 'value1', 'claim2': 'value2' },
            scopes: ['scope1', 'scope2']
          }
        },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        extendedRequestId: 'request-id',
        httpMethod: 'GET',
        path: '/my/path',
        protocol: 'HTTP/1.1',
        requestId: 'x-request-id',
        requestTime: '04/Mar/2020:19:15:17 +0000',
        requestTimeEpoch: 1583349317135,
        resourceId: null,
        resourcePath: '/my/path',
        stage: '$default',
        identity: {
          accessKey: null,
          accountId: null,
          caller: null,
          cognitoAuthenticationProvider: null,
          cognitoAuthenticationType: null,
          cognitoIdentityId: null,
          cognitoIdentityPoolId: null,
          principalOrgId: null,
          sourceIp: 'IP',
          user: null,
          userAgent: 'user-agent',
          userArn: null
        },
      },
      pathParameters: null,
      stageVariables: null,
      body: 'Hello from Lambda',
      isBase64Encoded: false
    };

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
        apiId: 'id',
        authorizer: {
          jwt: {
            claims: { 'claim1': 'value1', 'claim2': 'value2' },
            scopes: ['scope1', 'scope2']
          }
        },
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'GET',
          path: '/my/path',
          protocol: 'HTTP/1.1',
          sourceIp: 'IP',
          userAgent: 'agent'
        },
        requestId: 'x-request-id',
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

    await handler1(v1Event, context);
    await handler2(v2Event, context);

    //Remove the event and context objects as those will be different
    delete requestV1.event;
    delete requestV2.event;
    delete requestV1.requestContext;
    delete requestV2.requestContext;

    expect(JSON.stringify(requestV1)).to.equal(JSON.stringify(requestV2));
  });

  it('should support transforming the response', async () => {
    const handler = serverless((req, res) => {
      res.end('');
    }, {
        response: (res) => {
          res.statusCode = 201;
          res.headers['foo'] = 'bar';
          res.setHeader('bar', 'baz');
        }
      });

    const obj = await handler({});
    expect(obj.statusCode).to.equal(201);
    expect(obj.headers).to.have.property('foo', 'bar');
    expect(obj.headers).to.have.property('bar', 'baz');
  });

  it('should handle unicode when inferring content-length', async () => {
    const body = `{"foo":"অ"}`;

    let length;

    const handler = serverless((req, res) => {
      length = req.headers['content-length'];
      res.end('');
    });

    await handler({ body });
    expect(length).to.equal(13);
  });

  it('should throw if event.body is a number', async () => {
    const body = 42;

    const handler = serverless((req, res) => {
      res.end('');
    });

    await expect(handler({ body }))
      .to.be.rejectedWith(Error, 'Unexpected event.body type: number');
  });

  it('should stringify if event.body is an object', async () => {
    const body = { foo: 'bar' };
    const expected = Buffer.from(JSON.stringify(body));
    let actual;
    const handler = serverless((req, res) => {
      actual = req.body;
      res.end('');
    });

    await handler({ body });
    expect(actual).to.deep.equal(expected);
  });

  it('should accept a Buffer body', async () => {
    const body = Buffer.from('hello world');

    const handler = serverless((req, res) => {
      getStream(req).then(str => {
        res.end(str);
      });
    });

    const res = await handler({ body });
    expect(res)
      .to.be.an('Object')
      .with.a.property('body', 'hello world');
  });

  it('should stringify an Object body if content-type is json', async () => {
    const body = { foo: 'bar' };
    const headers = { 'content-type': 'application/json' };

    const handler = serverless((req, res) => {
      getStream(req).then(str => {
        res.end(str);
      });
    });

    const res = await handler({ body, headers });
    expect(res)
      .to.be.an('Object')
      .with.a.property('body', '{"foo":"bar"}');
  });

  it('should support returning a promise that rejects and not need a callback', async () => {
    const handler = serverless(() => {
      throw new Error('test');
    });

    await expect(handler({})).to.be.rejectedWith('test');
  });

  it('should supporte res.writeHead', async () => {
    const handler = serverless((req, res) => {
      res.writeHead(301, { Location: '/foo', });
      res.end();
    });

    const response = await handler({});
    expect(response.statusCode).to.equal(301);
    expect(response.headers).to.have.property('location', '/foo');
  });

});
