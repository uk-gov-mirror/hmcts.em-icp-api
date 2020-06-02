import * as express from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "../models/session";
import { redisClient as redis } from "../app";
import { IdamClient } from "../security/idam-client";
const router = express.Router();

router.get("/icp/sessions/:caseId", (req, res) => {
  const idam = new IdamClient();
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).send({error: "Unauthorized user"});
  }

  idam.verifyToken(token)
    .then(() => {
      idam.getUserInfo(req.header("Authorization"))
        .then((response: any) => {
          const username = response.name;
          const caseId: string = req.params.caseId;

          if (!caseId || caseId === "null" || caseId === "undefined") {
            res.statusMessage = "Invalid case id";
            return res.status(400).send();
          }

          const today = Date.now();
          redis.hgetall(caseId, (e: string, session: any) => {
            if (e) {
              return res.status(500).send();
            }

            if (!session || new Date(parseInt(session.dateOfHearing)).toDateString() !== new Date(today).toDateString()) {
              const newSession: Session = {
                sessionId: uuidv4(),
                caseId: caseId,
                dateOfHearing: today,
                presenterId: "",
                presenterName: ""
              };

              redis.hmset(caseId, newSession);
              return res.send({
                username: username,
                session: {sessionId: newSession.sessionId, caseId: newSession.caseId, dateOfHearing: newSession.dateOfHearing}
              });
            } else if (new Date(parseInt(session.dateOfHearing)).toDateString() === new Date(today).toDateString()) {
              return res.send({
                username: username,
                session: {sessionId: session.sessionId, caseId: session.caseId, dateOfHearing: session.dateOfHearing}
              });
            }
          });
      }).catch((error) => res.status(error.response.status).send({error: error.response.data.error_description}));
    })
    .catch((err) => res.status(401).send({error: err.message}));
});

module.exports = router;
