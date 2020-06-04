const config = require("@hmcts/properties-volume").addTo(require("config"));
const {get, set} = require("lodash");

const setSecret = (secretPath, configPath) => {
  if (config.has(secretPath)) {
    set(config, configPath, get(config, secretPath));
  }
};

const setupSecrets = () => {
  if (config.has("secrets.icp")) {
    setSecret("secrets.icp.redis-password", "redis.password");
    setSecret("secrets.icp.microservicekey-em-icp", "s2s.secret");
    setSecret("secrets.icp.AppInsightsInstrumentationKey", "appInsights.instrumentationKey");
  }
};

module.exports = setupSecrets;
