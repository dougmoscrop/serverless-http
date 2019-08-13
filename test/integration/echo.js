'use strict';

module.exports.handler = async (event, context) => {
  const body = JSON.stringify({ event, context }, null, 2);

  console.log(body);

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json'
    },
    body,
  };
};
