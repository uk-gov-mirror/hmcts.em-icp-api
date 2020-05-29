import { Server, Socket } from "socket.io";
import { redisClient as redis } from "./app";
import { Participant } from "./models/participant";

const actions = require("./models/actions");
const socketio = require("socket.io");

const socket = (server: Server) => {

  const io = socketio(server, {"origins": "*:*"} );

  io.on("connection", (client: Socket) => {
      console.log("SocketIO client connecting...");

      client.on("join", (data) => {
        redis.hgetall(data.caseId, (error: string, session: any) => {
          if (error || !session) {
            throw new Error();
          }

          if (session.sessionId === data.sessionId) {
            client.join(data.sessionId);
          }

          io.to(client.id).emit(actions.CLIENT_JOINED,
            { client: { id: client.id, username: data.username },
                    presenter: { id: session.presenterId, username: session.presenterName }});

          redis.lpush(data.sessionId, {username: session.username, clientId: client.id}, (err: string) => {
            if (err) {
              throw new Error();
            }
            redis.hgetall(data.sessionId, (e: string, participants: Participant[]) => {
              io.to(session.sessionId).emit(actions.PARTICIPANTS_UPDATED, participants);
            });
          });
        });
      });

      client.on(actions.UPDATE_SCREEN, (screen) => {
        io.in(screen.sessionId).emit(actions.SCREEN_UPDATED, screen.body);
      });

      client.on(actions.UPDATE_PRESENTER, (change) => {
        redis.hset(change.caseId, change, (err: string) => {
          if (err) {
            throw new Error();
          }
        });

        io.in(change.sessionId).emit(actions.PRESENTER_UPDATED,
          { presenter: { id: change.presenterId, username: change.presenterName }});
      });

      client.on("leave", (data) => {
        client.disconnect();
      });

      client.on("disconnecting", () => {
        Object.keys(client.rooms)
          .forEach(room => {
            redis.hgetall(room, (e: string, participants: Participant[]) => {
              const updatedParticipantsList = participants.filter(p => p.id !== client.id);
              redis.hset(room, updatedParticipantsList);
            });
            io.in(room).emit(actions.CLIENT_DISCONNECTED, { clientDisconnected: client.id } );
          });

        client.leave(client.id);
        client.disconnect();

        console.log("SocketIO client disconnecting");
      });
    });
};

module.exports = socket;
