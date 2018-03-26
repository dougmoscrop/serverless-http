'use strict';

const express = require('express');

const serverless = require('./serverless-http');

const app = express();

app.use(function (req, res) {
  res.status(200).send('This is a test');
});

module.exports.handler = serverless(app);
