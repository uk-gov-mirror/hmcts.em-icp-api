import * as express from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "../models/session";
import { UserInfo } from "../models/userInfo";
import { redisClient as redis } from "../app";
import { IdamClient } from "../security/idam-client";
const { Logger } = require("@hmcts/nodejs-logging");
const router = express.Router();
const idam = new IdamClient();
const logger = Logger.getLogger("sessions");


router.get("/icp/sessions/:caseId", async (req, res) => {
  logger.info("Session endpoint: Have reached the session endpoint...");
  logger.info("Redis setting foo");
  await redis.set("foo", "bar");
  logger.info("Redis setting test 1");
  await redis.set("test1", "bar");
  logger.info("Redis setting test 2");
  await redis.set("test2", "bar");
  logger.info("Redis setting test3");
  await redis.set("test3", "bar");

  const token = req.header("Authorization");
  if (!token) {
    logger.error("No Authorization header found");
    return res.status(401).send({error: "Unauthorized user"});
  }

  logger.info("Session endpoint: Verify the auth token...");

  try {
    await idam.verifyToken(token);
  } catch (e) {
    logger.error(e);
    return res.status(401).send({error: e});
  }

  logger.info("Session endpoint: Getting user info...");
  const userInfo: UserInfo = await idam.getUserInfo(token);
  const username = userInfo.name;
  const caseId: string = req.params.caseId;

  if (!caseId || caseId === "null" || caseId === "undefined") {
    logger.error("Invalid case id");
    res.statusMessage = "Invalid case id";
    return res.status(400).send();
  }

  logger.info("Session endpoint: Accessing Redis session info...");
  const today = Date.now();
  await redis.hgetall(caseId, (e: string, session) => {
    logger.info("Error?: ", e);
    logger.info("Session?: ", session);
    if (e) {
      return res.status(500).send();
    }

    if (!session || new Date(parseInt(session.dateOfHearing)).toDateString() !== new Date(today).toDateString()) {
      const newSession: Session = {
        sessionId: uuidv4(),
        caseId: caseId,
        dateOfHearing: today,
        presenterId: "",
        presenterName: "",
      };
      logger.info("Session endpoint: Creating a new session object...");
      redis.hmset(caseId, newSession);
      return res.send({
        username: username,
        session: {sessionId: newSession.sessionId, caseId: newSession.caseId, dateOfHearing: newSession.dateOfHearing},
      });
    } else if (new Date(parseInt(session.dateOfHearing)).toDateString() === new Date(today).toDateString()) {
      logger.info("Session endpoint: Returning an existing session object...");
      return res.send({
        username: username,
        session: {sessionId: session.sessionId, caseId: session.caseId, dateOfHearing: session.dateOfHearing},
      });
    }
  });
});

module.exports = router;
