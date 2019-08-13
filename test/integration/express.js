'use strict';

const express = require('express');

const serverless = require('../../serverless-http');

const app = express();

app.get('/express', function (req, res) {
  res.status(200).json({
    originalUrl: req.originalUrl,
    url: req.url,
    method: req.method.toLowerCase(),
  });
});

app.post('/express', function (req, res) {
  res.status(200).json({
    originalUrl: req.originalUrl,
    url: req.url,
    method: req.method.toLowerCase(),
  });
});

app.put('/express', function (req, res) {
  res.status(200).json({
    originalUrl: req.originalUrl,
    url: req.url,
    method: req.method.toLowerCase(),
  });
});

app.get('/express/pathed/:id', function (req, res) {
  res.status(200).json({
    originalUrl: req.originalUrl,
    url: req.url,
    method: req.method.toLowerCase(),
    id: req.params.id,
  });
});

module.exports.handler = serverless(app);
