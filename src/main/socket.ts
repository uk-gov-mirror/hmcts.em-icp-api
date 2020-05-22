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
        if (session.sessionId === data.sessionId) {
          client.join(data.sessionId);
        }
        if (io.sockets.adapter.rooms[data.sessionId].length === 1) {
          io.in(data.sessionId).emit(actions.PRESENTER_UPDATED, { presenterId: client.id } );
        }
        io.to(client.id).emit(actions.CLIENT_JOINED, client.id);
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
