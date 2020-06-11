// socket.test.ts


// import { Socket } from 'socket.io';
//
// import chai from 'chai';
//
// const socketio = require('socket.io');
// const server = require('../../main/server');
// const io = socketio(server, {'origins': '*:*'} );
//
// describe('Socket-Server', function () {
//
//   const EXPECTED_TIMEOUT = 2000;
//   it('socketio should never let it connect', function(done) {
//     this.timeout(EXPECTED_TIMEOUT + 100);
//     const timeout = setTimeout(done, EXPECTED_TIMEOUT);
//
//     io.on('connect', () => {
//       clearTimeout(timeout);
//       done(new Error('Unexpected call'));
//     });
//   });
//
//   it( 'user connected and able to send msg through socket.', function (done) {
//     this.timeout(EXPECTED_TIMEOUT + 100);
//     const timeout = setTimeout(done, EXPECTED_TIMEOUT);
//     io.emit('connection')
//     io.on('connection', (client: Socket) => {
//       console.log(client);
//       clearTimeout(timeout);
//       done(new Error('Unexpected call'));
//     });
//   });
// });


// import chai from 'chai';
// import { Socket } from 'socket.io';
//
// const app = require('express')(),
//   server = require('http').Server(app);
//
// const io = require('socket.io-client');
// const sockets = require('../../main/socket');
//
// const ioServer = require('socket.io')(server, {
//   cookie: false,
//   pingTimeout: 30000,
//   pingInterval: 2000,
// });
//
// sockets(ioServer);
// server.listen(3000);
//
// describe('Connecting successfully and disconnecting', function () {
//
//   const socket1 = io('http://localhost:3000',
//     {forceNew: true, autoConnect: false, query: ''});
//   const socket2 = io('http://localhost:3000',
//     {forceNew: true, autoConnect: false, query: ''});
//
//   it('client should connect', function (done) {
//     ioServer.on('connection', (socket: Socket) => {
//       chai.assert.notEqual(socket, null, 'socket should not be null');
//     });
//   });
//
//   it('should register event', function (done) {
//     socket1.on('hello', (msg: string) => {
//       if (msg === 'world') {
//         done();
//       }
//     });
//     socket1.emit('event');
//   });
// });

// import chai from 'chai';
// import { Socket } from 'socket.io';















// const app = require("express")();
// const server = require("http").Server(app);
// const os = require("os");
//
// const io = require("socket.io-client");
// const sockets = require("../../main/socket");
//
// const ioServer = require("socket.io")(server, {
//   cookie: false,
//   pingTimeout: 30000,
//   pingInterval: 2000,
// });
//
// sockets(ioServer);
// server.listen(3000);
//
// const endPoint = "http://" + os.hostname() + ":3000";
// const opts = {forceNew: true};
//
// describe("async test with socket.io", function () {
//   this.timeout(10000);
//
//   after(async () => {
//     server.close();
//   });
//
//   it("Response should be an object", function (done) {
//     setTimeout(function () {
//       const socketClient = io(endPoint, opts);
//
//       socketClient.emit("connection", "ABCDEF");
//
//       socketClient.on("join", function (data: any) {
//         data.should.be.an("object");
//         socketClient.disconnect();
//         done();
//       });
//
//       socketClient.on("[Icp] Update Screen", function (data: any) {
//         console.error(data);
//         socketClient.disconnect();
//         done();
//       });
//     }, 4000);
//   });
// });
