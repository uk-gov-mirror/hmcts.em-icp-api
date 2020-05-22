import { Server, Socket } from 'socket.io';
import { redisClient as redis } from './app';

const actions = require('models/actions');
const socketio = require('socket.io');

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const socket = (server: Server) => {

  const io = socketio(server, {'origins': '*:*'} );

  io.on('connection', function (client: Socket) {
    console.log('SocketIO client connecting...');

    client.on('join', (data) => {
      redis.hgetall(data.caseId, (err: string, session: any) => {
        if (err || !session) {
          throw new Error();
        }

        if (session.sessionId === data.sessionId) {
          client.join(data.sessionId);
        }

        const presenterId = io.sockets.adapter.rooms[data.sessionId].length === 1 ? client.id : session.presenter;
        io.to(client.id).emit(actions.CLIENT_JOINED, { clientId: client.id, presenterId: presenterId } );

        if (presenterId !== session.presenter) {
          redis.hset(data.caseId, 'presenter', presenterId, (err: string) => {
            if (err) {
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
      io.in(change.sessionId).emit(actions.PRESENTER_UPDATED, change.body);
    });

    client.on('disconnect', () => {
      Object.keys(client.rooms)
        .forEach(room => io.in(room).emit(actions.CLIENT_DISCONNECTED, { clientDisconnected: client.id } ));

      console.log('SocketIO client disconnected');
    });
  });
};

module.exports = socket;
