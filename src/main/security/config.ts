import * as aksVaultConfig from "config";
import * as propertiesVolume from "@hmcts/properties-volume";
propertiesVolume.addTo(aksVaultConfig);

const IDAM_SECRET = aksVaultConfig.secrets ? aksVaultConfig.secrets["rpa-icp-api"]["show-oauth2-token"] : undefined;
const S2S_KEY = aksVaultConfig.secrets ? aksVaultConfig.secrets["rpa-icp-api"]["microservicekey-em-gw"] : undefined;

export const config = {
  idam: {
    url: process.env["IDAM_URL"] || "http://localhost:5000",
    client: "icp-api",
    secret: IDAM_SECRET  || "AAAAAAAAAAAAAAAA",
    redirect: "https://rpa-icp-api.service.core-compute-aat.internal/oauth2/callback",
  },
  s2s: {
    url: process.env["S2S_URL"] || "http://localhost:4502",
    secret: S2S_KEY || "AAAAAAAAAAAAAAAA",
    microservice: "em_gw"
  },
  tokenRefreshTime: 60 * 60 * 1000,
};
