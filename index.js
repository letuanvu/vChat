var mongoose = require('mongoose');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//config port
http.listen(3000, function () {
    console.log('listening on *:3000');
});

mongoose.Promise = global.Promise;
// Or using promises
mongoose.connect('mongodb://localhost:27017/vChat', {}).then(
    () => {
        console.log('connected mongodb');
        /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
        io.on('connection', function (socket) {
            console.log('a user connected');
            /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
            socket.on('test', function () {
                console.log('test testtest test test');
            });
        });
    },
    err => {
        /** handle initial connection error*/
        console.log('connect mongodb failed');
    }
);
