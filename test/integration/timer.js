'use strict';

const express = require('express');

const serverless = require('../../serverless-http');

const app = express();

app.use(function (req, res) {
  setTimeout(() => {
    console.log('taking my time');
  }, 30000)
  res.status(200).json({
    url: req.url
  });
});

module.exports.handler = serverless(app);
