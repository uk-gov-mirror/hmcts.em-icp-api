import { Server, Socket } from "socket.io";
import { redisClient as redis } from "./app";

const actions = require("./models/actions");
const socketio = require("socket.io");

const socket = (server: Server) => {

  const io = socketio(server, {"origins": "*:*"} );

  // this allows us to set up middleware
  io.on("connection", (client: Socket) => {
      console.log("SocketIO client connecting...");

      client.on("join", (data) => {
        redis.hgetall(data.caseId, (err: string, session: any) => {
          if (err || !session) {
            throw new Error();
          }

          if (session.sessionId === data.sessionId) {
            client.join(data.sessionId);
          }

          const presenterId = io.sockets.adapter.rooms[data.sessionId].length === 1 ? client.id : session.presenterId;
          io.to(client.id).emit(actions.CLIENT_JOINED, { clientId: client.id, presenterId: presenterId } );

          if (presenterId !== session.presenterId) {
            redis.hset(data.caseId, "presenterId", presenterId, (error: string) => {
              if (error) {
                throw new Error();
              }
            });
          }
        });
      });

      client.on(actions.UPDATE_SCREEN, (screen) => {
        io.in(screen.sessionId).emit(actions.SCREEN_UPDATED, screen.body);
      });

      client.on(actions.UPDATE_PRESENTER, (change) => {
        redis.hset(change.caseId, "presenterId", change.body, (err: string) => {
          if (err) {
            throw new Error();
          }
        });

        io.in(change.sessionId).emit(actions.PRESENTER_UPDATED, change.body);
      });

      client.on("leave", (data) => {
        client.leave(data.sessionId);
      });

      client.on("disconnecting", () => {
        Object.keys(client.rooms)
          .forEach(room => io.in(room).emit(actions.CLIENT_DISCONNECTED, { clientDisconnected: client.id } ));

        client.leave(client.id);
        client.disconnect();

        console.log("SocketIO client disconnecting");
      });
    });
};

module.exports = socket;
