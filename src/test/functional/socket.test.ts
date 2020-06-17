import { TestUtil } from "./testUtil";
import chai from "chai";

const actions = require("../../main/models/actions");
const io = require("socket.io-client");
const testUtil = new TestUtil();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe("Socket io functional tests", () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:8080";
  const username = "b@a.com";
  const password = "4590fgvhbfgbDdffm3lk4j";

  let icpSession;
  let socket;

  beforeEach(async () => {
    await testUtil.createNewUser(username, password);
    const token = await testUtil.requestUserToken(username, password);

    icpSession = await testUtil.createIcpSession(token, "1234");

    socket = io.connect(baseUrl, {
      path: "/icp/socket.io",
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  });

  afterEach(() => {
    socket.disconnect();
    socket.close();
  });

  it("connect to web socket server", (done) => {
    console.log(socket);
    socket.on("connect", () => {
      chai.expect(socket.connected).equal(true);
      done();
    });
  });

  it("join web socket icp session and trigger CLIENT_JOINED event", (done) => {
    socket.on(actions.CLIENT_JOINED, (data) => {
      chai.expect(data.client.id).equal(socket.id);
      chai.expect(data.client.username).equal("John Smith");
      chai.expect(data.presenter.id).equal("");
      chai.expect(data.presenter.username).equal("");
      done();
    });
    socket.emit("join", icpSession);
  });

  it("join web socket icp session and trigger NEW_PARTICIPANT_JOINED event", (done) => {
    socket.on(actions.NEW_PARTICIPANT_JOINED, () => {
      done();
    });
    socket.emit("join", icpSession);
  });

  // it("emit screen update and listen for SCREEN_UPDATED event", (done) => {
  //   socket.emit("join", icpSession);
  //
  //   const update = {
  //     body: {
  //       pageNumber: 1,
  //       scale: 1,
  //       top: 100,
  //       left: 12,
  //       rotation: 180,
  //     },
  //     sessionId: icpSession.session.sessionId,
  //   };
  //
  //   socket.on(actions.SCREEN_UPDATED, (data) => {
  //     chai.expect(data.pageNumber).equal(update.body.pageNumber);
  //     chai.expect(data.scale).equal(update.body.scale);
  //     chai.expect(data.top).equal(update.body.top);
  //     chai.expect(data.left).equal(update.body.left);
  //     chai.expect(data.rotation).equal(update.body.rotation);
  //     done();
  //   });
  //
  //   socket.emit(actions.UPDATE_SCREEN, update);
  // });
  //
  // it("emit screen update and listen for PRESENTER_UPDATED event", (done) => {
  //   socket.emit("join", icpSession);
  //
  //   const change = {
  //     icpSession, presenterId: "999", presenterName: "bob",
  //   };
  //
  //   socket.on(actions.PRESENTER_UPDATED, (data) => {
  //     console.log(data);
  //     done();
  //   });
  //
  //   socket.emit(actions.UPDATE_PRESENTER, change);
  // });
  //
  // it("emit leave event and listen for CLIENT_DISCONNECTED event", (done) => {
  //   socket.emit("join", icpSession);
  //
  //   socket.on(actions.CLIENT_DISCONNECTED, (data) => {
  //     console.log(data);
  //     done();
  //   });
  //
  //   socket.emit("leave");
  // });
});
