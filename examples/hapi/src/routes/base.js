
module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.response({
        msg: 'Hello, world!',
        serverless: request.serverless
      })
    }
  }
]
