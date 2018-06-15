'use strict';

const express = require('express');

const serverless = require('./serverless-http');

const app = express();

app.use(function (req, res) {
  res.sendFile('image.png', { root : __dirname});
});

module.exports.handler = serverless(app, {
  binary: ['image/*']
});
