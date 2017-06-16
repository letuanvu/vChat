import mongoose from 'mongoose';

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const roomSchema = new Schema({
    title: {
        type: String,
        // required: true,
        // minlength: [5, 'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH}).'],
    },
    connections: { type: [String], required: true, /*unique: true*/ },
    seenmessage: { type: [{uid: String, messageid: String}], /*unique: true*/ },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
})

//Write some encrption for Password
const Room = mongoose.model('Room', roomSchema);
export default Room;
