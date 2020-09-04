import { redisClient as redis } from "../../app";
import * as express from "express";

const healthcheck = require("@hmcts/nodejs-healthcheck");
const router = express.Router();

const healthCheckConfig = {
  checks: {
    redis: healthcheck.raw(() => {
      return redis.status === "ready" ? healthcheck.up() : healthcheck.down();
    }),
  },
};

healthcheck.addTo(router, healthCheckConfig);

module.exports = router;
