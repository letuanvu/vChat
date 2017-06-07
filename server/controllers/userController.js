import db from './../models';

const userController = {};

userController.add = (username, socketids) => {
    return new Promise((res, rej) => {
        //validation
        const user = new db.User({
            username: username,
            _socketids: socketids,
        });
        user.save(function (err) {
            if (err) rej(err);
            res({ data: user });
        });
    });
}

userController.login = (username, socketid) => {
    console.log('username, socketid');
    console.log(username, socketid);
    return new Promise((res, rej) => {
        db.User.findOne({ 'username': username },
            'username, _socketids'
            , function (err, user) {
                if (err) rej(err);
                if (user) {
                    user._socketids.push(socketid);
                    user.save(function (err) {
                        if (err) rej(err);
                        res({
                            data: {
                                username: username,
                                _socketids: user._socketids,
                                _id: user._id,
                            },
                        });
                    });
                } else {
                    userController.add(username, [socketid])
                        .then((newUser) => {
                            res({ newUser: true, data: newUser });
                        }).catch((err) => {
                            rej(err);
                        });
                }
            }
        );
    });
};

userController.removeSocketId = (userId, socketId) => {
    return new Promise((res, rej) => {
        db.User.findById(
            userId,
            'username _socketids',
            function (err, person) {
                if (err) rej(err);

                for (var key in person._socketids) {
                    if (person._socketids[key] == socketId) person._socketids.splice(key);
                }
                person.save(function (err) {
                    if (err) rej(err);
                    res({ data: person });
                });
            });
    });
};


userController.getListUser = () => {
    return new Promise((res, rej) => {
        db.User.find(
            { _socketids: { $exists: true, $ne: [] } },
            function (err, listOnline) {
                if (err) rej(err);
                res({ data: listOnline });
            });
    });
};

export default userController;