'use strict';

const express = require('express')
const cookieParser = require('cookie-parser')
const lambdaLog = require('lambda-log')
const serverless = require('../../serverless-http');

const app = express()
app.use(cookieParser())
app.get('/cookies', getAppContainerHtml)

module.exports.handler = serverless(app)

function getAppContainerHtml (req, res) {
  lambdaLog.options.debug = true
  lambdaLog.options.meta.cookies = req.cookies
  lambdaLog.debug('Retrieving appContainerPlaceholderHtml')

  const appContainerPlaceholderHTML = 'Some random string'

  if (appContainerPlaceholderHTML && appContainerPlaceholderHTML.length) {
    lambdaLog.debug('Successfully retrieved appContainerPlaceholderHtml', {
      appContainerPlaceholderHtml: appContainerPlaceholderHTML
    })
  } else {
    lambdaLog.warn('Received empty string instead of appContainerPlaceholder', {
      appContainerPlaceholderHtml: appContainerPlaceholderHTML
    })
  }

  return res.status(200).send(appContainerPlaceholderHTML)
}
