import chai from "chai";
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const request = require("superagent");
const config = require("config");
const frontendUrl = config.testUrl;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const healthcheckRequest = (url, cb) => {
  return request
    .get(`${url}/health`)
    .end((err, res) => {
      if (err) {
        throw err;
      }
      cb(res);
    });
};

chai.use(chaiHttp);

describe("ICP Server health check", () => {
  it("should return a 200 status code", done => {
    healthcheckRequest(frontendUrl, res => {
      expect(res).to.have.status(200);
      done();
    });
  });

  it("should return status UP", done => {
    healthcheckRequest(frontendUrl, res => {
      expect(res.body.status).to.equal("UP");
      done();
    });
  });
});
