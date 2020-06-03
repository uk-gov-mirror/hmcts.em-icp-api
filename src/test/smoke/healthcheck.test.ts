import chai from "chai";
import chaiHttp from "chai-http";
import { app } from "../../main/app";

chai.use(chaiHttp);

describe("ICP Server health check", () => {
  it("should return a 200 status code", done => {
    chai.request(app)
      .get("/health")
      .end((err, res) => {
        chai.expect(res.status).to.be.equal(200);
        done();
      });
  });

  it("should return status UP", done => {
    chai.request(app)
      .get("/health")
      .end((err, res) => {
        chai.expect(res.body.status).to.equal("UP");
        done();
      });
  });
});
