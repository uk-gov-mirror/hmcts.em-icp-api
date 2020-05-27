import * as chai from "chai";
import * as sinon from "sinon";
import { ServiceAuthProviderClient } from "../../../main/security/service-auth-provider-client";
import Axios from "axios";

describe("ServiceAuthProviderClient", () => {
  it("get a token", async () => {
    const mockResponse = { data: "token"};
    const http = Axios.create();
    const fake = sinon.fake.resolves(mockResponse);

    sinon.replace(http, "post", fake);

    const client = new ServiceAuthProviderClient();
    const token = await client.getToken();

    chai.expect(token).to.equal("Bearer token");
  });
});
