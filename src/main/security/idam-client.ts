import Axios, { AxiosInstance } from "axios";
const config = require("config");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");


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

  public async getUserInfo(token: string): Promise<string> {
    const headers = {
      "Authorization": token
    };

    try {
      const response = await this.http.get("/o/userinfo", { headers });
      return response.data;
    }
    catch (err) {
      throw err;
    }
  }

  public async verifyToken(token: string) {
    const tokenString = token.split(" ")[1];
    this.decodeToken(token)
      .then((decodedToken: any) => {
        this.getJwks()
          .then(keys => {
            const pem = jwkToPem(decodedToken);

            jwt.verify(tokenString, pem, {algorithms: decodedToken.alg}, (err: any, outcome: any) => {
              if (err) {
                throw err;
              }
            });
        })
        .catch((err) => {
          throw err;
        });
      })
      .catch((error) => {
        throw error;
      });
  }

  private async decodeToken(token: string) {
    return await jwt.decode(token).then((decoded: any) => {
      return decoded.header;
    });
  }

  private async getJwks() {
    try {
      const response = await this.http.get("/o/jwks");
      return response.data;
    }
    catch (err) {
      throw err;
    }
  }
}
