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

                socket.on('csa-hasOneChat', function (data) {
                    console.log('csa-hasOneChat:data: ', data);
                    console.log('csa-hasOneChat:socket.uInfo: ', socket.uInfo);
                    // console.log(socket.uInfo._id, data.u_id);
                    roomController.checkHasOneChat(socket.uInfo._id, data.u_id)
                        .then((res) => {
                            if (res.newRoom) {
                                console.log('newRoom');
                            }
                            console.log(res.data);
                        }).catch((err) => {
                            console.log(err);
                        });
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
