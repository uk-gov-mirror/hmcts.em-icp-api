import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../../main/app';

chai.use(chaiHttp);

describe('/GET health', () => {
  it('it should return (200) OK', (done) => {
    chai.request(app)
      .get('/health')
      .end((err, res) => {
        console.log(res.body);
        chai.expect(res.body).to.be.an('object');
        chai.expect(res.status).to.have.status(200);
        done();
      });
  });
});
