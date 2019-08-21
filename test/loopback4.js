"use strict";

const loopback = require("@loopback/rest"),
  expect = require("chai").expect,
  request = require("./util/request");

describe("loopback", () => {
  let app;

  beforeEach(function() {

    const restApp = new loopback.RestApplication();

    const spec = {
      responses: {
        '200': {
          description: 'greeting text',
          content: {
            'application/json': {
              schema: {type: 'string'},
            },
          },
        },
      },
    };

    restApp.route("get", "/", spec, function greet() {
      return "Hello, world!";
    }); // attaches route to RestServer

    app = restApp.requestHandler;
  });

  it("basic hello world", async () => {
    return await request(app, {
      httpMethod: "GET",
      path: "/"
    }).then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal("Hello, world!");
    });
  });
});
