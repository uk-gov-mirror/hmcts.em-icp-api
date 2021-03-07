import Axios, { AxiosInstance } from "axios";
import { UserInfo } from "../model/interfaces";

const config = require("config");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const jwtDecode = require("jwt-decode");
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
      const tokenString = token.split(" ")[1];
      const decodedHeader = jwtDecode(tokenString, { header: true });
      this.logger.info("checkpoint tokenString", decodedHeader);

      const algorithm = await this.getJwks(decodedHeader.alg);
      // this.logger.info("checkpoint tokenString", algorithm);

      const pem = jwkToPem(algorithm);
      // this.logger.info("checkpoint tokenString", pem);

      return await jwt.verify(tokenString, pem, { algorithms: algorithm.alg });
    } catch (e) {
      this.logger.error("Idam Client: Error encountered when verifying User token");
      this.logger.error(e);
      throw e;
    }
  }

  private async getJwks(algorithm: string) {
    const response = await this.http.get("/o/jwks");
    return response.data.keys.find((key) => key.alg === algorithm);
  }
}
