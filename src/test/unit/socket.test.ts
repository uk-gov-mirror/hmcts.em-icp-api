import chai from "chai";
import { app } from "../../main/app";

const server = app.listen(8080);
const socketio = require("socket.io");
const client = require("socket.io-client");

describe("Socket io", () => {
  let socket;

  beforeEach(async () => {
    socketio(server, {
      path: "/icp/socket.io",
    });

    socket = client.connect("http://localhost:8080", {
      path: "/icp/socket.io",
      extraHeaders: {
        Authorization: "Bearer token",
      },
    });
  });

  it("it should connect to socket server", (done) => {
    socket.on("connect", () => {
      chai.expect(socket.connected).equal(true);
      done();
    });
  });
});

