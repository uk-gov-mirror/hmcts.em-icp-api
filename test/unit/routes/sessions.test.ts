import chai from "chai";
import chaiHttp from "chai-http";
import { IdamClient } from "../../../app/security/idam-client";
import { app } from "../../../app";

const sinon = require("sinon");

chai.use(chaiHttp);

describe("/GET sessions", () => {
  it("it should return (200) OK", (done) => {
    const idamVerifyTokenStub = sinon.stub(IdamClient.prototype, "verifyToken").returns(Promise.resolve());
    const idamGetUserInfoStub = sinon.stub(IdamClient.prototype, "getUserInfo")
      .returns(Promise.resolve({ name: "Test User" }));

    setTimeout(() => {
      chai.request(app)
        .get("/icp/sessions/1234")
        .set("Authorization", "Token")
        .end((err, res) => {
          chai.expect(res.body).to.be.an("object");
          chai.expect(res.body.username).to.equal("Test User");
          chai.expect(res.body.session.caseId).to.equal("1234");
          chai.expect(res.status).to.equal(200);

          idamVerifyTokenStub.restore();
          idamGetUserInfoStub.restore();

          done();
        });
    });
  });

  it("it should return (401) Unauthorized when invalid Auth token is passed", (done) => {
    setTimeout(() => {
      chai.request(app)
        .get("/icp/sessions/1234")
        .set("Authorization", "Token")
        .end((err, res) => {
          chai.expect(res.body).to.be.an("object");
          chai.expect(res.status).to.equal(401);
          done();
        });
    });
  });

  it("it should return (400) Bad Request on null caseId", (done) => {
    const idamVerifyTokenStub = sinon.stub(IdamClient.prototype, "verifyToken").returns(Promise.resolve());
    const idamGetUserInfoStub = sinon.stub(IdamClient.prototype, "getUserInfo")
      .returns(Promise.resolve({ name: "Test User" }));

    setTimeout(() => {
      chai.request(app)
        .get("/icp/sessions/null")
        .set("Authorization", "Token")
        .end((err, res) => {
          chai.expect(res.status).to.equal(400);

          idamVerifyTokenStub.restore();
          idamGetUserInfoStub.restore();

          done();
        });
    });
  });

  it("it should return (400) Bad Request on undefined caseId", (done) => {
    const idamVerifyTokenStub = sinon.stub(IdamClient.prototype, "verifyToken").returns(Promise.resolve());
    const idamGetUserInfoStub = sinon.stub(IdamClient.prototype, "getUserInfo")
      .returns(Promise.resolve({ name: "Test User" }));

    setTimeout(() => {
      chai.request(app)
        .get("/icp/sessions/undefined")
        .set("Authorization", "Token")
        .end((err, res) => {
          chai.expect(res.status).to.equal(400);

          idamVerifyTokenStub.restore();
          idamGetUserInfoStub.restore();

          done();
        });
    });
  });

  it("it should return (401) Unauthorized when no Authorization header is passed", (done) => {
    chai.request(app)
      .get("/icp/sessions/1234")
      .end((err, res) => {
        chai.expect(res.status).to.equal(401);
        done();
      });
  });
});
