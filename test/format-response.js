'use strict';

const formatResponse = require('../lib/provider/aws/format-response');
const Response = require('../lib/response');
const expect = require('chai').expect;

describe('format-response', function() {

  it('throws on chunked transfer-encoding', () => {
    const response = new Response({});
    response._headers = { 'transfer-encoding': 'chunked' };
    expect(() => formatResponse(response, {})).to.throw(Error, 'chunked encoding not supported');
  });

  it('throws on res.chunkedEncoding', () => {
    const response = new Response({});
    response.chunkedEncoding = true;

    expect(() => formatResponse(response, {})).to.throw(Error, 'chunked encoding not supported');
  });

});
