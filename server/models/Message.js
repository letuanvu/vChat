import mongoose from 'mongoose';

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const messageSchema = new Schema({
    _userId: { type: Schema.ObjectId, ref: 'User', required: true, },
    _roomId: { type: Schema.ObjectId, ref: 'Room', required: true, },
    body: {
        type: String,
        required: true,
        // minlength: [5, 'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH}).'],
    },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
});

//Write some encrption for Password
const Message = mongoose.model('Message', messageSchema);
export default Message;