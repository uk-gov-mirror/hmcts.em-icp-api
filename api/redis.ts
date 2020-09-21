import * as propertiesVolume from "@hmcts/properties-volume";

const config = require("config");
const Redis = require(config.redis.import);
propertiesVolume.addTo(config);

const REDIS_PASSWORD = config.secrets ? config.secrets["em-icp"]["redis-password"] : undefined;

const tlsOptions = {
  password: REDIS_PASSWORD,
  tls: true,
};
const redisOptions = config.redis.useTLS === "true" ? tlsOptions : {};
export const redisClient = new Redis(config.redis.port, config.redis.host, redisOptions);

redisClient.on("ready", () => {
  console.log("Redis is ready");
});

redisClient.on("error", (err: { message: string; }) => {
  console.log("Error in Redis: ", err.message);
});
