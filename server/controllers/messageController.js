import db from './../models';

const messageController = {};

messageController.add = (data) => {
    return new Promise((res, rej) => {
        //validation
        const message = new db.Message({
            _userId: data.userId,
            _roomId: data.roomId,
            body: data.body,
        });
        message.save(function (err) {
            if (err) rej(err);
            res({ data: message });
        });
    });
}

messageController.getListMessage = (data) => {
    return new Promise((res, rej) => {
        //validation
        db.Message.find(
            { _roomId: data.roomId },
            function (err, listMessage) {
                if (err) rej(err);
                res({ data: listMessage });
            });
    });
}

export default messageController;