import Axios from "axios";
import { IdamClient } from "../../../api/security/idam-client";
import { beforeEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";

describe("IdamClient", () => {

  let server, idamClient, sandbox;
  const get = (url) => {
    if (url === "/o/userinfo") {
      return Promise.resolve({ data: "userInfo" });
    } else {
      return Promise.resolve({ data: { keys: [{ alg: "RS256" }] } });
    }
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    server = { get: get };
    sandbox.stub(Axios, "create").returns(server);
    idamClient = new IdamClient();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("it should get user info", async () => {
    const userInfo = await idamClient.getUserInfo("jwtToken");
    expect(userInfo).to.eq("userInfo");
  });

  it("it should verify token", async () => {
    sandbox.spy(idamClient.logger, "info");
    sandbox.spy(idamClient.logger, "error");
    await idamClient.verifyToken("Bearer jwtToken")
      .catch((err) => {
        expect(err.message).to.contain("Invalid token specified:");
        expect(idamClient.logger.error.called).to.be.true;
      });
  });
});
