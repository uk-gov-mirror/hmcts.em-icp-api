import * as express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../models/Session';
import { redisClient as redis } from '../app';

const router = express.Router();

router.get('/icp/sessions/:caseId',(req, res) => {
  const caseId: string = req.params.caseId;
  const today = Date.now();

  redis.hgetall(caseId, (err: string, session: any) => {
    if (err !== null) {
      throw new Error();
    }

    if (session === null || new Date(parseInt(session.dateOfHearing)).toDateString() !== new Date(today).toDateString()) {
      const newSession: Session = {
        sessionId: uuidv4(),
        caseId: caseId,
        dateOfHearing: today,
      };

      redis.hmset(caseId, newSession);
      res.send(newSession);
    } else if (new Date(parseInt(session.dateOfHearing)).toDateString() === new Date(today).toDateString()) {
      res.send(session);
    }
  });
});

module.exports = router;
