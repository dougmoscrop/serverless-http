
// Modules
const hapi = require('hapi')
const plugins = require('./plugins')

// Config
const port = process.env.APP_PORT || 8080

// Server
const serverParams = { port }
const server = hapi.server(serverParams)

// Routes
server.route(require('./routes/base'))

// Main
const getServer = async () => {
  await server.register(plugins)
  return server
}

const listen = async () => {
  await server.start()
  console.log(`Server running at: ${server.info.uri}`)
}

// Export
module.exports = {
  getServer,
  listen
}
