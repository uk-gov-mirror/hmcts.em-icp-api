import { redisClient as redis } from "../app";
import * as express from "express";

const healthcheck = require("@hmcts/nodejs-healthcheck");
const router = express.Router();

const healthCheckConfig = {
  checks: {
    // add one for idam / forgerock (auth service)
    redis: healthcheck.raw(() => {
      return redis.connected ? healthcheck.up() : healthcheck.down();
    }),
  },
};

healthcheck.addTo(router, healthCheckConfig);

module.exports = router;
