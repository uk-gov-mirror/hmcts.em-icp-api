import * as bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import * as path from "path";
import { RouterFinder } from "./router/routerFinder";
import { HttpError } from "./httpError";
// import { TokenSet, UserinfoResponse } from "openid-client";
// import { Issuer, Strategy } from "openid-client";
import Axios from "axios";
import csrf from "csurf";

const config = require("config");
const { Express, Logger } = require("@hmcts/nodejs-logging");
const { setupDev } = require("./development");
const redis = require("redis");
const sessions = require("./routes/sessions");
const healthcheck = require("./routes/health");
const helmet = require("helmet");
const noCache = require("nocache");
const env = process.env.NODE_ENV || "development";
const developmentMode = env === "development";

export const redisClient = redis.createClient({
  host : config.redis.host,
  port : config.redis.port,
  password: config.redis.password
});

redisClient.on("ready", () => {
  console.log("Redis is ready");
});

redisClient.on("error", (err: { message: string; }) => {
  console.log("Error in Redis: ", err.message);
});

const http = Axios.create({
  baseURL: config.idam.url
});

export const app = express();
app.locals.ENV = env;

app.use(Express.accessLogger());

// const verify = (tokenset: TokenSet, userinfo: UserinfoResponse, done: (err: any, user?: any) => void) => {
//   logger.info("verify okay, user:", userinfo);
//   return done(null, { tokenset, userinfo });
// };

// export const oidc = (async () => {
//   const issuer = await Issuer.discover(`${config.idam.url}/o/.well-known/openid-configuration`);
//   const client = new issuer.Client({
//     client_id: config.idam.client,
//     client_secret: config.idam.secret,
//     redirect_uris: [config.idam.redirect],
//     scope: "openid roles profile",
//   });
//   return new Strategy(
//     {
//       client: client,
//       params: {
//         redirect_uri: config.idam.redirect,
//         scope: "openid roles profile",
//       }
//     },
//     verify,
//   );
// })();

async function checkAuthentication(req: any) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": req.header("Authorization")
  };

  const params = {
    "client_id": config.idam.client,
    "scope": "openid roles profile",
    "response_type": "code",
    "redirect_uri": config.idam.redirect
  };

  try {
    const response = await http.post("/o/authorize", null, { headers, params });
    return response.data;
  }
  catch (err) {
    throw err;
  }
}

const logger = Logger.getLogger("app");

app.use(noCache());
app.use(helmet());
app.use(helmet.xssFilter({setOnOldIE: true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader(
      "Cache-Control",
      "no-cache, max-age=0, must-revalidate, no-store",
    );
  next();
});
app.use("/", RouterFinder.findAll(path.join(__dirname, "routes")));
setupDev(app, developmentMode);

app.use((req, res) => {
  res.status(404);
  res.send("not-found");
});

app.use((err: HttpError, req: express.Request, res: express.Response) => {
  logger.error(`${err.stack || err}`);

  res.locals.message = err.message;
  res.locals.error = env === "development" ? err : {};
  res.status(err.status || 500);
  res.send("error");
});

if (config.app.useCSRFProtection === "true") {
  app.use(csrf(), (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
}

app.use("/health", healthcheck);

app.use("/", checkAuthentication, sessions);
