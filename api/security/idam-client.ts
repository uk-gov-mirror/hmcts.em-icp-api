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
      const jwKey = await this.getJwks(decodedHeader.alg);
      const pem = jwkToPem(jwKey);
      return await jwt.verify(tokenString, pem, { algorithms: jwKey.alg });
    } catch (e) {
      this.logger.error("Idam Client: Error encountered when verifying User token");
      this.logger.error(e);
      throw e;
    }
  }

  public async getJwks(algorithm: string) {
    // const response = await this.http.get("/o/jwks") as any;
    const response = {
      "keys": [
        {
          "alg": "RS384",
          "kty": "RSA",
          "use": "sig",
          "kid": "1er0WRwgIOTAFojE4rC/fbeKu3I=",
          "n": "01uAHoJeLguETwCkjNocgjmDwstRtJAJEcZbMH-m8InvZxWUEJl7Icjgb_gx_NCLkkjo7HEs0XaBTiwZyxxVN8gKym2HKEdiP3z9c2W-H0Uu7mD3a0o366mUWrgi1cg8V6X7jwex2C7j7NJV4gxqWQBlXNHRBeLjmxWe-KRHSrRO_-713jieib0r3LbZ_AoXshxYw7zo5mcvkKYv9M5QduLXEcJI6UT1YfXYUogVARIkMvjHO2cA5St1NGdBZtB4u8vvJwZSfp2aNlGCgZ4NxL9t-C6oDgNYYLJVgwh79wgwrz1i9uNRHaNal109-9sr2LJuHkw2AIPMH6bfhlgJUQ",
          "e": "AQAB",
          "x5c": [
            "MIIDQjCCAiqgAwIBAgIQOfM9akpxRRGCmqP7k6I4GjANBgkqhkiG9w0BAQsFADAeMRwwGgYDVQQDExNDTElHZXREZWZhdWx0UG9saWN5MB4XDTIwMTIwNDEwMzAxOFoXDTIxMTIwNDEwNDAxOFowHjEcMBoGA1UEAxMTQ0xJR2V0RGVmYXVsdFBvbGljeTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANNbgB6CXi4LhE8ApIzaHII5g8LLUbSQCRHGWzB/pvCJ72cVlBCZeyHI4G/4MfzQi5JI6OxxLNF2gU4sGcscVTfICspthyhHYj98/XNlvh9FLu5g92tKN+uplFq4ItXIPFel+48Hsdgu4+zSVeIMalkAZVzR0QXi45sVnvikR0q0Tv/u9d44nom9K9y22fwKF7IcWMO86OZnL5CmL/TOUHbi1xHCSOlE9WH12FKIFQESJDL4xztnAOUrdTRnQWbQeLvL7ycGUn6dmjZRgoGeDcS/bfguqA4DWGCyVYMIe/cIMK89YvbjUR2jWpddPfvbK9iybh5MNgCDzB+m34ZYCVECAwEAAaN8MHowDgYDVR0PAQH/BAQDAgG+MAkGA1UdEwQCMAAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMB8GA1UdIwQYMBaAFL09leR2dfva6lyZO4Ph75zD2wkrMB0GA1UdDgQWBBS9PZXkdnX72upcmTuD4e+cw9sJKzANBgkqhkiG9w0BAQsFAAOCAQEACUOCDd6fsA1jl+ebyZrsieQUsfAcUt8bSYaMgOFtBFh+hIOuoJ6bvbVgMryHO5Y1VQokoRjLHo9avWVYU9j+JGkV89buOkfPJ3Ik3AYHrugzbhHAIPRiZjSK2s0ne6QFJrY0ihD9RBGGXK4Gb8kQU0KUPQrJ/sAyWeImu8Q78CZsWjQyC0/cpxH5BS3zNu03EvhYFDFgVURFj/J+JO2yjmU02x4BckC+hMcbgIFzS9Ltjr7hD7vQ1EsXGfLLusHyXMY5FkbfM6LmsYsLkRn1bnLUOnoUSNHcZHFMgFjn3fDCBZ2VU9ElTDBPHjZA+AoWpIC2lKRH5At3nVeHTXzlWg==",
          ],
          "x5t": "n7HSYi22lF1Jym0h9p9DP_N1YBg",
        },
        {
          "alg": "RS512",
          "kty": "RSA",
          "use": "sig",
          "kid": "1er0WRwgIOTAFojE4rC/fbeKu3I=",
          "n": "01uAHoJeLguETwCkjNocgjmDwstRtJAJEcZbMH-m8InvZxWUEJl7Icjgb_gx_NCLkkjo7HEs0XaBTiwZyxxVN8gKym2HKEdiP3z9c2W-H0Uu7mD3a0o366mUWrgi1cg8V6X7jwex2C7j7NJV4gxqWQBlXNHRBeLjmxWe-KRHSrRO_-713jieib0r3LbZ_AoXshxYw7zo5mcvkKYv9M5QduLXEcJI6UT1YfXYUogVARIkMvjHO2cA5St1NGdBZtB4u8vvJwZSfp2aNlGCgZ4NxL9t-C6oDgNYYLJVgwh79wgwrz1i9uNRHaNal109-9sr2LJuHkw2AIPMH6bfhlgJUQ",
          "e": "AQAB",
          "x5c": [
            "MIIDQjCCAiqgAwIBAgIQOfM9akpxRRGCmqP7k6I4GjANBgkqhkiG9w0BAQsFADAeMRwwGgYDVQQDExNDTElHZXREZWZhdWx0UG9saWN5MB4XDTIwMTIwNDEwMzAxOFoXDTIxMTIwNDEwNDAxOFowHjEcMBoGA1UEAxMTQ0xJR2V0RGVmYXVsdFBvbGljeTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANNbgB6CXi4LhE8ApIzaHII5g8LLUbSQCRHGWzB/pvCJ72cVlBCZeyHI4G/4MfzQi5JI6OxxLNF2gU4sGcscVTfICspthyhHYj98/XNlvh9FLu5g92tKN+uplFq4ItXIPFel+48Hsdgu4+zSVeIMalkAZVzR0QXi45sVnvikR0q0Tv/u9d44nom9K9y22fwKF7IcWMO86OZnL5CmL/TOUHbi1xHCSOlE9WH12FKIFQESJDL4xztnAOUrdTRnQWbQeLvL7ycGUn6dmjZRgoGeDcS/bfguqA4DWGCyVYMIe/cIMK89YvbjUR2jWpddPfvbK9iybh5MNgCDzB+m34ZYCVECAwEAAaN8MHowDgYDVR0PAQH/BAQDAgG+MAkGA1UdEwQCMAAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMB8GA1UdIwQYMBaAFL09leR2dfva6lyZO4Ph75zD2wkrMB0GA1UdDgQWBBS9PZXkdnX72upcmTuD4e+cw9sJKzANBgkqhkiG9w0BAQsFAAOCAQEACUOCDd6fsA1jl+ebyZrsieQUsfAcUt8bSYaMgOFtBFh+hIOuoJ6bvbVgMryHO5Y1VQokoRjLHo9avWVYU9j+JGkV89buOkfPJ3Ik3AYHrugzbhHAIPRiZjSK2s0ne6QFJrY0ihD9RBGGXK4Gb8kQU0KUPQrJ/sAyWeImu8Q78CZsWjQyC0/cpxH5BS3zNu03EvhYFDFgVURFj/J+JO2yjmU02x4BckC+hMcbgIFzS9Ltjr7hD7vQ1EsXGfLLusHyXMY5FkbfM6LmsYsLkRn1bnLUOnoUSNHcZHFMgFjn3fDCBZ2VU9ElTDBPHjZA+AoWpIC2lKRH5At3nVeHTXzlWg==",
          ],
          "x5t": "n7HSYi22lF1Jym0h9p9DP_N1YBg",
        },
        {
          "alg": "RS256",
          "kty": "RSA",
          "use": "sig",
          "kid": "1er0WRwgIOTAFojE4rC/fbeKu3I=",
          "n": "01uAHoJeLguETwCkjNocgjmDwstRtJAJEcZbMH-m8InvZxWUEJl7Icjgb_gx_NCLkkjo7HEs0XaBTiwZyxxVN8gKym2HKEdiP3z9c2W-H0Uu7mD3a0o366mUWrgi1cg8V6X7jwex2C7j7NJV4gxqWQBlXNHRBeLjmxWe-KRHSrRO_-713jieib0r3LbZ_AoXshxYw7zo5mcvkKYv9M5QduLXEcJI6UT1YfXYUogVARIkMvjHO2cA5St1NGdBZtB4u8vvJwZSfp2aNlGCgZ4NxL9t-C6oDgNYYLJVgwh79wgwrz1i9uNRHaNal109-9sr2LJuHkw2AIPMH6bfhlgJUQ",
          "e": "AQAB",
          "x5c": [
            "MIIDQjCCAiqgAwIBAgIQOfM9akpxRRGCmqP7k6I4GjANBgkqhkiG9w0BAQsFADAeMRwwGgYDVQQDExNDTElHZXREZWZhdWx0UG9saWN5MB4XDTIwMTIwNDEwMzAxOFoXDTIxMTIwNDEwNDAxOFowHjEcMBoGA1UEAxMTQ0xJR2V0RGVmYXVsdFBvbGljeTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANNbgB6CXi4LhE8ApIzaHII5g8LLUbSQCRHGWzB/pvCJ72cVlBCZeyHI4G/4MfzQi5JI6OxxLNF2gU4sGcscVTfICspthyhHYj98/XNlvh9FLu5g92tKN+uplFq4ItXIPFel+48Hsdgu4+zSVeIMalkAZVzR0QXi45sVnvikR0q0Tv/u9d44nom9K9y22fwKF7IcWMO86OZnL5CmL/TOUHbi1xHCSOlE9WH12FKIFQESJDL4xztnAOUrdTRnQWbQeLvL7ycGUn6dmjZRgoGeDcS/bfguqA4DWGCyVYMIe/cIMK89YvbjUR2jWpddPfvbK9iybh5MNgCDzB+m34ZYCVECAwEAAaN8MHowDgYDVR0PAQH/BAQDAgG+MAkGA1UdEwQCMAAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMB8GA1UdIwQYMBaAFL09leR2dfva6lyZO4Ph75zD2wkrMB0GA1UdDgQWBBS9PZXkdnX72upcmTuD4e+cw9sJKzANBgkqhkiG9w0BAQsFAAOCAQEACUOCDd6fsA1jl+ebyZrsieQUsfAcUt8bSYaMgOFtBFh+hIOuoJ6bvbVgMryHO5Y1VQokoRjLHo9avWVYU9j+JGkV89buOkfPJ3Ik3AYHrugzbhHAIPRiZjSK2s0ne6QFJrY0ihD9RBGGXK4Gb8kQU0KUPQrJ/sAyWeImu8Q78CZsWjQyC0/cpxH5BS3zNu03EvhYFDFgVURFj/J+JO2yjmU02x4BckC+hMcbgIFzS9Ltjr7hD7vQ1EsXGfLLusHyXMY5FkbfM6LmsYsLkRn1bnLUOnoUSNHcZHFMgFjn3fDCBZ2VU9ElTDBPHjZA+AoWpIC2lKRH5At3nVeHTXzlWg==",
          ],
          "x5t": "n7HSYi22lF1Jym0h9p9DP_N1YBg",
        },
      ],
    };
    // this.logger.info("this the jwKey", response.keys);
    return response.keys.find((key) => key.alg === algorithm);
  }
}
