'use strict';

const isBinary = require('../lib/is-binary');
const { expect } = require('chai');

describe('is-binary', function() {

  it('handles charset', function() {
    const result = isBinary({ ['content-type']: 'application/json; charset:utf-8' }, {
      binary: ['application/json']
    });

    expect(result).to.be.true;
  });

});
