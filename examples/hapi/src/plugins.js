
const serverlessPlugin = {
  name: 'Serverless Plugin',
  version: '1.0.0',
  register: async (server) => {
    server.ext('onRequest', (request, h) => {
      try {
        request.serverless = request.raw.req.serverless
      } catch (err) {
        console.log('err:', err)
        request.serverless = {}
      }

      return h.continue
    })
  }
}

module.exports = [serverlessPlugin]
