import Axios, { AxiosInstance } from "axios";
import { UserInfo } from "../models/userInfo";
const config = require("config");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const jwtDecode = require("jwt-decode");

/**
 * IDAM client that handles token authentication
 */
export class IdamClient {

  private readonly http: AxiosInstance;

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

  public async verifyToken(token: string) {
    const tokenString = token.split(" ")[1];
    const decodedHeader = jwtDecode(tokenString, { header: true });
    const algorithm = await this.getJwks(decodedHeader.alg);
    const pem = jwkToPem(algorithm);
    return await jwt.verify(tokenString, pem, {algorithms: algorithm.alg}, (err) => {
      if (err) {
        throw err;
      }
    });
  }

  private async getJwks(algorithm: string) {
    const response = await this.http.get("/o/jwks");
    return response.data.keys.find((key: any) => key.alg === algorithm);
  }
}
