const serverless = require('../../serverless-http');
const express = require('express');
const pino = require('pino');
const pinoHttp = require('pino-http');

const app = express();
const basicPinoLogger = pino({level: 'info'});
const expressPino = pinoHttp({
  logger: basicPinoLogger
});

app.use(expressPino);

app.get('/pino', (req, res) => {
  return res.status(200).json({status: 'ok'});
});

exports.handler = serverless(app);