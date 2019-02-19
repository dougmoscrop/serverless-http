
// Modules
const serverless = require('serverless-http')
const { getServer } = require('./server')

// Cache
let handler

// Handler
module.exports.handler = async (event, context) => {
  if (!handler) {
    const app = await getServer()
    handler = serverless(app, {
      request: (request) => {
        request.serverless = { event, context }
      }
    })
  }

  const res = await handler(event, context)

  return res
}
