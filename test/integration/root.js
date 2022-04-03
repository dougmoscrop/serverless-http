'use strict';

const express = require('express');

const serverless = require('../../serverless-http');

const app = express();

app.get('/', function (req, res) {
  res.status(200).json({
    originalUrl: req.originalUrl,
    url: req.url,
    method: req.method.toLowerCase(),
  });
});

module.exports.handler = serverless(app);
