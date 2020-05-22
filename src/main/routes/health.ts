const healthcheck = require('@hmcts/nodejs-healthcheck');
import * as express from 'express';

const router = express.Router();

const healthCheckConfig = {
  checks: {
    sampleCheck: healthcheck.raw(() => healthcheck.up()),
  },
};

healthcheck.addTo(router, healthCheckConfig);

module.exports = router;
