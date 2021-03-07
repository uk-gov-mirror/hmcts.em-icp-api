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
        expect(idamClient.logger.info.called).to.be.true;
      });
  });

  it.only('should verify my token', async function () {
    const token = "Bearer eyJ0eXAiOiJKV1QiLCJ6aXAiOiJOT05FIiwia2lkIjoiMWVyMFdSd2dJT1RBRm9qRTRyQy9mYmVLdTNJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJpY3BfdGVzdF91c2VyQGV2aWRlbmNlLmNvbSIsImN0cyI6Ik9BVVRIMl9TVEFURUxFU1NfR1JBTlQiLCJhdXRoX2xldmVsIjowLCJhdWRpdFRyYWNraW5nSWQiOiIyZTgxYTg3OS1hNjFkLTRkNjgtOTllZS03MDU2MzUzMmI0ZDQtMzc2MDAxMCIsImlzcyI6Imh0dHBzOi8vZm9yZ2Vyb2NrLWFtLnNlcnZpY2UuY29yZS1jb21wdXRlLWlkYW0tYWF0Mi5pbnRlcm5hbDo4NDQzL29wZW5hbS9vYXV0aDIvcmVhbG1zL3Jvb3QvcmVhbG1zL2htY3RzIiwidG9rZW5OYW1lIjoiYWNjZXNzX3Rva2VuIiwidG9rZW5fdHlwZSI6IkJlYXJlciIsImF1dGhHcmFudElkIjoiNEctMHNETFhKc2t4MzhMZ2dneGlLaHFEM1RRIiwiYXVkIjoid2Vic2hvdyIsIm5iZiI6MTYxNTEzODE5MSwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIl0sImF1dGhfdGltZSI6MTYxNTEzODE5MSwicmVhbG0iOiIvaG1jdHMiLCJleHAiOjE2MTUxNjY5OTEsImlhdCI6MTYxNTEzODE5MSwiZXhwaXJlc19pbiI6Mjg4MDAsImp0aSI6Iml2OTVScnFlRFBnY0s1OTg3eVo0MkJncnNMcyJ9.zSIlmeVI10hbkjWKSXkuSs0mYHlrkG8kEisddIo1l4N_D0I5fxhJcoomDEhecnrV_YojzQWBakoOy8uRegC45USg4H2k71MFaqXwaLRKiGmTo_EhQ2MY5_LWko6Pqe-5tfzts3w32ZAeqSAxbnTjxpN3pcHByYiyNBVrWtipIyf62_toctbu4BdZmwYgcC9j8tb3-s-dQbrpzbSXA_Cw3aSnln7Z-lXUbWazQTGlVOEPjMc2b9WHct6drYvIygHVQjJSv0ls3MSMMZYRm5t2Jce4a-5fZRBN_lAStg6g3qoUpB5xr9uLjLaAC3pnr-pO41Kw2zfUbRyScD4Ip_VzzQ";
    await idamClient.verifyToken(token);
  });
});
