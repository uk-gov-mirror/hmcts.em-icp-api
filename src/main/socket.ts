import { Server, Socket } from "socket.io";
import { redisClient as redis } from "./app";
import { IdamClient } from "./security/idam-client";

const actions = require("./models/actions");
const socketio = require("socket.io");

const idam = new IdamClient();

const socket = (server: Server) => {

  const io = socketio(server, { "origins": "*:*" , path: "/icp/socket.io" } );

  io.use((client: Socket, next) => {
    idam.verifyToken(client.request.headers["authorization"])
      .then(() => {
        next();
      }).catch((err => {
        client.disconnect();
        next(err);
      }));
  }).on("connection", (client: Socket) => {
    console.log("SocketIO client connecting...");

    client.on("join", (data) => {
      redis.hgetall(data.caseId, (error: string, session) => {
        if (error || !session) {
          throw new Error();
        }

        if (session.sessionId === data.sessionId) {
          client.join(data.sessionId);
        }

        if (io.sockets.adapter.rooms[session.sessionId].length === 1) {
          session.presenterName = "";
          session.presenterId = "";
          redis.watch(session.caseId, (watchError) => {
            if (watchError) {
              throw watchError;
            }
            redis.multi()
              .hset(session.caseId, "presenterId", "")
              .hset(session.caseId, "presenterName", "")
              .exec((execError) => {
                if (execError) {
                  throw execError;
                }
              });
          });
        }

        io.to(client.id).emit(actions.CLIENT_JOINED,
          { client: { id: client.id, username: data.username },
            presenter: { id: session.presenterId, username: session.presenterName }});

        io.to(session.sessionId).emit(actions.NEW_PARTICIPANT_JOINED);
      });
    });

    client.on(actions.UPDATE_SCREEN, (screen) => {
      io.in(screen.sessionId).emit(actions.SCREEN_UPDATED, screen.body);
    });

    client.on(actions.UPDATE_PRESENTER, (change) => {
      redis.watch(change.caseId, (watchError) => {
        if (watchError) {
          throw watchError;
        }

        redis.multi()
          .hset(change.caseId, "presenterId", change.presenterId)
          .hset(change.caseId, "presenterName", change.presenterName)
          .exec((execError) => {
            if (execError) {
              throw execError;
            }
          });
      });

      io.in(change.sessionId).emit(actions.PRESENTER_UPDATED, {id: change.presenterId, username: change.presenterName});
    });

    client.on("leave", () => {
      client.disconnect();
    });

    client.on("disconnecting", () => {
      Object.keys(client.rooms)
        .forEach(room => {
          io.in(room).emit(actions.CLIENT_DISCONNECTED, client.id);
        });
      client.leave(client.id);

      console.log("SocketIO client disconnecting");
    });
  });
};

module.exports = socket;
