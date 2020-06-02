import { Server, Socket } from "socket.io";
import { redisClient as redis } from "./app";
import { Participant } from "./models/participant";
import { IdamClient } from "./security/idam-client";

const actions = require("./models/actions");
const socketio = require("socket.io");

const idam = new IdamClient();

const socket = (server: Server) => {

  const io = socketio(server, {"origins": "*:*"} );
  io.use((client: Socket, next: () => void) => {
    idam.verifyToken(client.handshake.query.token)
      .then(() => {
        next();
      }).catch((err => {
        throw err;
      }));
  }).on("connection", (client: Socket) => {
      console.log("SocketIO client connecting...");

      client.on("join", (data) => {
        redis.hgetall(data.caseId, (error: string, session: any) => {
          if (error || !session) {
            throw new Error();
          }

          if (session.sessionId === data.sessionId) {
            client.join(data.sessionId);
          }

          // if (io.sockets.adapter.rooms[session.sessionId].length === 0) {
          //   redis
          //     .multi()
          //     .set(session.caseId, "presenterId", "")
          //     .set()
          //     .exec((execError, results) => {});
          //
          //
          //   redis.hset(session.caseId, "presenterId", "");
          //   redis.hset(session.caseId, "presenterName", "");
          // }

          io.to(client.id).emit(actions.CLIENT_JOINED,
            { client: { id: client.id, username: data.username },
                    presenter: { id: session.presenterId, username: session.presenterName }});

          const newParticipant: Participant = {
            id: client.id,
            username: session.username
          };

          redis.lpush(data.sessionId, JSON.stringify(newParticipant), (err: string) => {
            if (err) {
              throw new Error();
            }
            redis.lrange(data.sessionId, 0, -1, (e: string, participants: string[]) => {
              io.to(session.sessionId).emit(actions.PARTICIPANTS_UPDATED, participants);
            });
          });
        });
      });

      client.on(actions.UPDATE_SCREEN, (screen) => {
        io.in(screen.sessionId).emit(actions.SCREEN_UPDATED, screen.body);
      });

      client.on(actions.UPDATE_PRESENTER, (change) => {
        redis.hset(change.caseId, "presenterId", change.presenterId);
        redis.hset(change.caseId, "presenterName", change.presenterName);

        io.in(change.sessionId).emit(actions.PRESENTER_UPDATED, {id: change.presenterId, username: change.presenterName});
      });

      client.on("leave", (data) => {
        client.disconnect();
      });

      client.on("disconnecting", () => {
        Object.keys(client.rooms)
          .forEach(room => {
            redis.lrange(room, 0, -1, (e: string, participants: string[]) => {
              const updatedParticipantsList = participants
                .map(p => JSON.parse(p))
                .filter(p => p.id !== client.id)
                .map(p => JSON.stringify(p));
              redis.hset(room, updatedParticipantsList);
            });
            io.in(room).emit(actions.CLIENT_DISCONNECTED, client.id);
          });
        client.leave(client.id);

        console.log("SocketIO client disconnecting");
      });
    });
};

module.exports = socket;
