import Axios, { AxiosInstance } from "axios";
import { config } from "../config";

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
      "Authorization": req.header("Authorization")
    };

    try {
      const response = await this.http.post("/o/authorize", { headers });
      console.log(response.data);
      return response.data;
    }
    catch (err) {
      throw err;
    }
  }
}
