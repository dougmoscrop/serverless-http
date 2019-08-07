'use strict';

const express = require('express');
const expect = require('chai').expect;
const request = require('./util/request');

const expectedFooResponse = 'foo!';

describe('base path', () => {
  let fooApp;

  beforeEach(() => {
    fooApp = express();
    fooApp.get('/test', (req, res) => {
      return res.send(expectedFooResponse);
    });
  });

  it('should allow for a base path to be set', () => {
    return request(fooApp, {
      httpMethod: 'GET',
      path: '/foo/test'
    }, { basePath: '/foo' })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal(expectedFooResponse)
      });
  });

  it('should remove stage path part', () => {
    return request(fooApp, {
      httpMethod: 'GET',
      path: '/dev/foo/test'
    }, { basePath: '/foo' })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal(expectedFooResponse)
      });
  });

  [
    '/dev/v1/foo/test',
    '/dev/foo/test',
    '/foo/test',
    '/___/v1/foo/test'
  ].map(testCase => {
    it(`should work locally and with api gateway (${testCase})`, () => {
      return request(fooApp, {
        httpMethod: 'GET',
        path: testCase
      }, { basePath: '/foo' })
        .then(response => {
          expect(response.statusCode).to.equal(200);
          expect(response.body).to.equal(expectedFooResponse)
        });
    });
  })
});
