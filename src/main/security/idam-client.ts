import Axios, { AxiosInstance } from "axios";
const config = require("config");

/**
 * IDAM client that creates a user then gets a token
 */
export class IdamClient {

  private readonly http: AxiosInstance;

  constructor() {
    this.http = Axios.create({
      baseURL: config.idam.url
    });
  }

  public async getUserInfo(jwt: string): Promise<string> {
    const headers = {
      "Authorization": jwt
    };

    try {
      const response = await this.http.get("/o/userinfo", { headers });
      return response.data;
    }
    catch (err) {
      throw err;
    }
  }

  public async authenticateRequest(req: any) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": req.header("Authorization")
    };

    const params = {
      "client_id": config.idam.client,
      "scope": "openid roles profile",
      "response_type": "code",
      "redirect_uri": config.idam.redirect
    };

    try {
      const response = await this.http.post("/o/authorize", null, { headers, params });
      return response.data;
    }
    catch (err) {
      throw err;
    }
  }
}
