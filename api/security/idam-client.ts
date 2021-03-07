import Axios, { AxiosInstance } from "axios";
import { UserInfo } from "../model/interfaces";

const config = require("config");
const { Logger } = require("@hmcts/nodejs-logging");

/**
 * IDAM client that handles token authentication
 */
export class IdamClient {

  private readonly http: AxiosInstance;
  logger = Logger.getLogger("idam-client");

  constructor() {
    this.http = Axios.create({
      baseURL: config.idam.url,
    });
  }

  public async getUserInfo(token: string): Promise<UserInfo> {
    const headers = {
      "Authorization": token,
    };
    const response = await this.http.get("/o/userinfo", { headers });
    return response.data;
  }

  public async verifyToken(token: string): Promise<void> {
    try {
      await this.getUserInfo(token);
    } catch (e) {
      this.logger.error("Idam Client: Error encountered when verifying User token");
      this.logger.error(e);
      throw e;
    }
  }
}
