import db from './../models';

const roomController = {};

roomController.add = (data) => {
    return new Promise((res, rej) => {
        //validation
        const room = new db.Room({
            title: data.title,
            connections: data.connections,
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
                    res({ data: room });
                } else {
                    roomController.add({ connections: connections })
                        .then((newRoom) => {
                            res({ newRoom: true, data: newRoom });
                        }).catch((err) => {
                            rej(err);
                        });
                }
            }
        );
    });
}

roomController.getListRoom = (userID) => {
    console.log('roomController.getListRoom: ');
    return new Promise((res, rej) => {
        db.Room.find({ connections: userID }
            // 'title, connections'
            , function (err, rooms) {
                if (err) rej(err);
                res({ data: rooms });
            }
        );
        // db.Room.find({ connections: userID })
        //     .populate('_userId', ['username', 'avatar'])
        //     .exec(function (err, listMessage) {
        //         if (err) rej(err);
        //         res({ data: listMessage });
        //     });
    });
}

export default roomController;