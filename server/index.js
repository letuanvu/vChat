var mongoose = require('mongoose');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//config port
http.listen(3000, function () {
    console.log('listening on *:3000');
});

//Controller Imports
import userController from './controllers/userController';
import roomController from './controllers/roomController';
import messageController from './controllers/messageController';

mongoose.Promise = global.Promise;
// Or using promises
mongoose.connect('mongodb://localhost:27017/vChat', {}).then(
    () => {
        console.log('connected mongodb');
        /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
        io.on('connection', function (socket) {
            socket.uInfo = {};
            console.log('a user connected');
            /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
            socket.on('csa-login', function (uInfo) {
                const { username } = uInfo;
                if (username) {
                    // userController.login(username, socket.id);
                    userController.login(username, socket.id)
                        .then((res) => {
                            socket.uInfo = res.data;
                            console.log('logined-uInfo:@@@@@@@@@@@@@@ ');
                            console.log(socket.uInfo);
                            socket.emit('ssa-login-sucessed', res.data);
                            roomController.getListRoom(socket.uInfo._id)
                                .then((res1) => {
                                    console.log('getListRoom');
                                    console.log(res1);
                                    res1.data.forEach(function (room, index) {
                                        socket.join(room._id);

                                        var messageSeen = room.seenmessage.find(x => x.uid == socket.uInfo._id).messageid;
                                        
                                        messageController.getLastestMesage(room._id)
                                        .then((lastMessageId) => {
                                            if(lastMessageId.data == messageSeen){
                                            } else {
                                                socket.emit('ssa-newmessage-notifi', room._id);
                                            }
                                        }).catch((err2) => {
                                            console.log(err2);
                                        });
                                        
                                    });
                                    console.log('io.sockets.adapter.rooms');
                                    console.log(io.sockets.adapter.rooms);
                                    
                                    socket.emit('ssa-list-room', {listRoom: res1.data, currentUsername: socket.uInfo._id});
                                }).catch((err1) => {
                                    console.log(err1);
                                });
                            userController.getListUser()
                                .then((res2) => {
                                    console.log('getListUser');
                                    console.log(res2);
                                    io.sockets.emit('ssa-list-user', res2.data);
                                }).catch((err2) => {
                                    console.log(err2);
                                });
                        }).catch((err) => {
                            console.log(err);
                        });
                } else {
                    console.log('data not found');
                }

                socket.on('csa-getListMessage', function(idRoom){
                  roomController.getRoom(idRoom)
                      .then((roomResult) => {
                        console.log(roomResult);
                        messageController.getListMessage({ roomId: roomResult.data._id })
                            .then((messageResult) => {
                                console.log('roomData: ');
                                console.log(messageResult.data);
                                socket.uInfo.currentRoom = roomResult.data._id;
                                socket.emit('ssa-roomData', {
                                    room: roomResult.data,
                                    message: messageResult.data,
                                });
                            }).catch((err1) => {
                                console.log(err1);
                            });
                      }).catch((err) => {
                          console.log(err);
                      });
                })

                socket.on('csa-hasOneChat', function (data) {
                    console.log('csa-hasOneChat:data: ', data);
                    console.log('csa-hasOneChat:socket.uInfo: ', socket.uInfo);
                    // console.log(socket.uInfo._id, data.u_id);
                    roomController.checkHasOneChat(socket.uInfo._id, data.u_id)
                        .then((roomResult) => {
                            if (roomResult.newRoom) {
                                console.log('newRoom');
                            }
                            console.log('roomController.checkHasOneChat:: res.data');
                            console.log(roomResult.data);
                            socket.uInfo.currentRoom = roomResult.data._id;
                            messageController.getListMessage({ roomId: roomResult.data._id })
                                .then((messageResult) => {
                                    console.log('roomData: ');
                                    console.log(messageResult.data);
                                    socket.emit('ssa-roomData', {
                                        room: roomResult.data,
                                        message: messageResult.data,
                                    });
                                }).catch((err1) => {
                                    console.log(err1);
                                })
                        }).catch((err) => {
                            console.log(err);
                        });
                });

                socket.on('csa-sendMessage', function (data) {
                    console.log('csa-sendMessage:data: ', data);
                    messageController.add({
                        userId: socket.uInfo._id,
                        roomId: socket.uInfo.currentRoom,
                        body: data.body,
                    })
                        .then((res) => {
                            console.log('newMessage');
                            console.log(res);
                            roomController.updateSeenSent(res.data)
                            .then(()=>{
                                roomController.getRoom(socket.uInfo.currentRoom)
                                .then((roomRes)=>{
                                    io.to(socket.uInfo.currentRoom).emit('ssa-new-message', {
                                        message: res.data,
                                        seen: roomRes.data.seenmessage
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                });
                            }).catch((err) => {
                                console.log(err);
                            });
                        }).catch((err) => {
                            console.log(err);
                        });
                });

                socket.on('csa-seenMessage',function(messId){
                    console.log('csa-seennnnnn');
                    var mess = {_userId: {_id: socket.uInfo._id}, _roomId: socket.uInfo.currentRoom, _id: messId};
                    roomController.updateSeenSent(mess)
                    .then(()=>{
                        roomController.getRoom(socket.uInfo.currentRoom)
                        .then((roomRes)=>{
                            io.to(socket.uInfo.currentRoom).emit('ssa-seenMessage', {
                                seen: roomRes.data.seenmessage
                            });
                            console.log('done-seennnnnn');
                        }).catch((err) => {
                            console.log(err);
                        });
                    }).catch((err)=>{
                        console.log(err);
                    })
                });

            });

            socket.on('disconnect', function () {
                console.log('disconnected', socket.uInfo.username);
                console.log('disconnected', socket.id);
                if (socket.uInfo._id) {
                    userController.removeSocketId(socket.uInfo._id, socket.id)
                        .then((res) => {
                            console.log('new uInfo affter remove a socketid');
                            console.log(res.data);
                        }).catch((err) => {
                            console.log('disconnect err: ' + err);
                        });
                }
            });
        });
    },
    err => {
        /** handle initial connection error*/
        console.log('connect mongodb failed');
    }
);
