'use strict';

const getBody = require('../lib/get-body');
const expect = require('chai').expect;

describe('get-body', function() {

  it('throws on chunked transfer-encoding', () => {
    expect(() => getBody({}, {'transfer-encoding': 'chunked' })).to.throw(Error, 'chunked encoding not supported');
  });

  it('throws on res.chunkedEncoding', () => {
    expect(() => getBody({ chunkedEncoding: true }, {})).to.throw(Error, 'chunked encoding not supported');
  });

});
