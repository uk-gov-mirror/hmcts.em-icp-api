import chai from "chai";
import chaiHttp from "chai-http";
import { app } from "../../../main/app";

chai.use(chaiHttp);

describe("/GET sessions", () => {
  it("it should return (200) OK", (done) => {
    chai.request(app)
      .get("/icp/sessions/1234")
      .end((err, res) => {
        console.log(err);
        chai.expect(res.body).to.be.an("object");
        chai.expect(res.body.caseId).to.equal("1234");
        chai.expect(res.body.presenterId).to.equal("");
        chai.expect(res.status).to.equal(200);
        done();
      });
  });

  it("it should return (400) Bad Request on null caseId", (done) => {
    chai.request(app)
      .get("/icp/sessions/null")
      .end((err, res) => {
        chai.expect(res.status).to.equal(400);
        done();
      });
  });

  it("it should return (400) Bad Request on undefined caseId", (done) => {
    chai.request(app)
      .get("/icp/sessions/undefined")
      .end((err, res) => {
        chai.expect(res.status).to.equal(400);
        done();
      });
  });
});
