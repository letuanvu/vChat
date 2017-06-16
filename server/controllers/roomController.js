import db from './../models';
var ObjectId = require('mongoose').Types.ObjectId;

const roomController = {};

roomController.add = (data) => {
    return new Promise((res, rej) => {
        //validation
        const room = new db.Room({
            title: data.title,
            connections: data.connections,
            seenmessage: data.seenmessage,
        });
        room.save(function (err) {
            if (err) rej(err);
            res({ data: room });
        });
    });
}

roomController.checkHasOneChat = (uId_1, uId_2) => {
    console.log('roomController.checkHasOneChat: ');
    console.log('uId_1', uId_1);
    console.log('uId_2', uId_2);

    const connections = Array(uId_1, uId_2).sort();

    console.log('connections: ', connections);
    return new Promise((res, rej) => {
        db.Room.findOne({ connections: connections }
            // 'title, connections'
            , function (err, room) {
                if (err) rej(err);
                if (room) {
                    roomController.getRoom(room._id)
                    .then((resultRoom)=>{
                        res({ data: resultRoom.data });
                    })
                } else {

                    var seenmessage = [];
                    for(var i = 0;i < connections.length;i++){
                      var connectSeen = {uid: connections[i], messageid: ''};
                      seenmessage.push(connectSeen);
                    }
                    console.log(seenmessage);

                    roomController.add({ connections: connections, seenmessage: seenmessage })
                        .then((newRoom) => {
                            roomController.getRoom(newRoom._id)
                            .then((resultRoom)=>{
                                res({ newRoom: true, data: resultRoom.data });
                            })
                        }).catch((err) => {
                            rej(err);
                        });
                }
            }
        );
    });
}

roomController.updateSeenSent = (message)=>{
  return new Promise((res,rej)=>{
    console.log('updateSeen');
    var userSendId = message._userId._id;
    var roomId = message._roomId;
    var messId = message._id;
    db.Room.findOne({_id: new ObjectId(message._roomId)}, function(err, room){
        // const seenmessageId = room.seenmessage.find(x => x.uid == userSendId)._id;
        db.Room.update({'seenmessage.uid': userSendId}, {'$set':{
            'seenmessage.$.messageid': messId,
        }}, function(err){
            if(err) rej(err);    
            res();
        })
    });
  });
}

roomController.getRoom = (roomId)=>{
    return new Promise((res,rej) =>{
      db.Room.findOne({_id: new ObjectId(roomId)})
        .populate({ path: 'seenmessage.uid', model: 'User', select:'username' })
        .exec(function (err, room) {
          if(err) rej(err);
          if(room){
            console.log(room);
              res({ data: room });
          }
        }
    );
    });
}

roomController.getListRoom = (userID) => {
    console.log('roomController.getListRoom: ');
    return new Promise((res, rej) => {
        db.Room.find({ connections: userID },
            // 'title, connections'
        )
            .populate({ path: 'connections', model: 'User' })
            .exec(function (err, rooms) {
                if (err) rej(err);
                console.log('sssssssssssrooms');
                console.log(rooms);
                res({ data: rooms });
            });
    });
}

export default roomController;
