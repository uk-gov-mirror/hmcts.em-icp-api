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
  console.log("Session endpoint: Have reached the session endpoint...");
  logger.info("Session endpoint: Have reached the session endpoint...");

  const token = req.header("Authorization");
  if (!token) {
    console.log("No Authorization header found");
    logger.error("No Authorization header found");
    return res.status(401).send({error: "Unauthorized user"});
  }

  console.log("Session endpoint: Verify the auth token...");
  logger.info("Session endpoint: Verify the auth token...");

  try {
    await idam.verifyToken(token);
  } catch (e) {
    console.log(e);
    logger.error(e);
    return res.status(401).send({error: e});
  }

  logger.info("Session endpoint: Getting user info...");
  const userInfo: UserInfo = await idam.getUserInfo(token);
  const username = userInfo.name;
  const caseId: string = req.params.caseId;

  if (!caseId || caseId === "null" || caseId === "undefined") {
    console.log("Invalid case id");
    logger.error("Invalid case id");
    res.statusMessage = "Invalid case id";
    return res.status(400).send();
  }

  console.log("Session endpoint: Accessing Redis session info...");
  logger.info("Session endpoint: Accessing Redis session info...");
  const today = Date.now();
  redis.hgetall(caseId, (e: string, session) => {
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
      console.log("Session endpoint: Creating a new session object...");
      logger.info("Session endpoint: Creating a new session object...");
      redis.hmset(caseId, newSession);
      return res.send({
        username: username,
        session: {sessionId: newSession.sessionId, caseId: newSession.caseId, dateOfHearing: newSession.dateOfHearing},
      });
    } else if (new Date(parseInt(session.dateOfHearing)).toDateString() === new Date(today).toDateString()) {
      console.log("Session endpoint: Returning an existing session object...");
      logger.info("Session endpoint: Returning an existing session object...");
      return res.send({
        username: username,
        session: {sessionId: session.sessionId, caseId: session.caseId, dateOfHearing: session.dateOfHearing},
      });
    }
  });
});

module.exports = router;
