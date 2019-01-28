
module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return {
        msg: 'Hello, world!',
        serverless: request.serverless
      }
    }
  }
]
