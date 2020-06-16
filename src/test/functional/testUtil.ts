import Axios, {AxiosInstance} from "axios";
import * as propertiesVolume from "@hmcts/properties-volume";

const config = require("config");
const url = require("url");

propertiesVolume.addTo(config);

export class TestUtil {

  private readonly http: AxiosInstance;
  private readonly idamHttp: AxiosInstance;

  constructor() {
    this.http = Axios.create({
      baseURL: process.env.TEST_URL || "http://localhost:8080",
    });

    this.idamHttp = Axios.create({
      baseURL: process.env["IDAM_API_BASE_URL"] || "http://localhost:5000",
    });
  }

  async createIcpSession(token: string, caseId: string) {
    const headers = {
      "Authorization": `Bearer ${token}`,
    };
    const response = await this.http.get(`/icp/sessions/${caseId}`, { headers: headers });
    return response.data;
  }

  async createNewUser(username: string, password: string) {
    await this.idamHttp.delete("/testing-support/accounts/b@a.com");
    const userInfo = {
      "email": username,
      "forename": "John",
      "password": password,
      "roles": [
        {
          "code": "caseworker",
        },
      ],
      "surname": "Smith",
    };

    try {
      await this.idamHttp.post("/testing-support/accounts", userInfo);
    } catch (err) {
      console.log("error creating new user");
      throw err;
    }
  }

  async requestUserToken(username: string, password: string) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const params = new url.URLSearchParams();
    params.append("scope", "openid roles profile");
    params.append("grant_type", "password");
    params.append("redirect_uri", process.env["FUNCTIONAL_TEST_CLIENT_OAUTH_SECRET"] || "http://localhost:8080/oauth2redirect");
    params.append("client_id", "webshow");
    params.append("client_secret", process.env["IDAM_API_BASE_URL"] || "AAAAAAAAAAAAAAAA");
    params.append("username", username);
    params.append("password", password);
    try {
      const response = await this.idamHttp.post("/o/token", params, { headers });
      return response.data["access_token"];
    } catch (err) {
      console.log("error fetching token");
      throw err;
    }
  }
}
