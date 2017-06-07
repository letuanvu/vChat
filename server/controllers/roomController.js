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

export default roomController;