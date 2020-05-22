import * as express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../models/Session';
import { redisClient as redis } from '../app';

const router = express.Router();

router.get('/icp/sessions/:caseId',(req, res) => {
  const caseId: string = req.params.caseId;

  if (!caseId || caseId === 'null' || caseId === 'undefined') {
    res.statusMessage = 'Invalid case id';
    return res.status(400).send();
  }

  const today = Date.now();
  redis.hgetall(caseId, (err: string, session: any) => {
    if (err !== null) {
      return res.status(500).send();
    }

    if (session === null || new Date(parseInt(session.dateOfHearing)).toDateString() !== new Date(today).toDateString()) {
      const newSession: Session = {
        sessionId: uuidv4(),
        caseId: caseId,
        dateOfHearing: today,
      };

      redis.hmset(caseId, newSession);
      return res.send(newSession);
    } else if (new Date(parseInt(session.dateOfHearing)).toDateString() === new Date(today).toDateString()) {
      return res.send(session);
    }
  });
});

module.exports = router;
