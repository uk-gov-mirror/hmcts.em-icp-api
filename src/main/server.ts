#!/usr/bin/env node
const { Logger } = require("@hmcts/nodejs-logging");
import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import { app } from "./app";

const setupSecrets = require("./setupSecrets");
const socket = require("./socket");
const logger = Logger.getLogger("server");
const port: number = parseInt(process.env.PORT, 10) || 8080;


// Setup secrets before loading the app
setupSecrets();

if (app.locals.ENV === "development") {
  const sslDirectory = path.join(__dirname, "resources", "localhost-ssl");

  const sslOptions = {
    cert: fs.readFileSync(path.join(sslDirectory, "localhost.crt")),
    key: fs.readFileSync(path.join(sslDirectory, "localhost.key")),
  };

  const server = https.createServer(sslOptions, app);

  server.listen(port, () => {
    logger.info(`Application started: https://localhost:${port}`);
  });

  socket(server);
} else {
  const server = app.listen(port, () => {
    logger.info(`Application started: http://localhost:${port}`);
  });

  socket(server);
}
