'use strict';

const http = require('http'),
    expect = require('chai').expect,
    request = require('./util/request');

describe('node http server', () => {
  let app;

  it('should set statusCode and default body', () => {
    app = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.write('Hello, world!')
        res.end()
    })
    return request(app, {
        httpMethod: 'GET',
        path: '/'
      })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.equal('Hello, world!');
      });
  })
})