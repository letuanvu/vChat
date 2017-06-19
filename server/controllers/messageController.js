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
            message.populate("_userId", function (err1, newMessage) {
                if (err1) rej(err1);
                res({ data: newMessage });
            });
        });
    });
}

messageController.getLastestMesage = (roomId) => {
    return new Promise((res, rej) => {    
        db.Message.findOne({ _roomId: roomId })
            .sort('-createdAt')
            // .limit(1)
            .exec(function (err, message) {
                if (err) rej(err);
                res({ data: message._id });
            });
    });
}

messageController.getListMessage = (data) => {
    return new Promise((res, rej) => {
        db.Message.find({ _roomId: data.roomId })
            .populate('_userId', ['username', 'avatar'])
            .exec(function (err, listMessage) {
                if (err) rej(err);
                res({ data: listMessage });
            });
    });
}

export default messageController;