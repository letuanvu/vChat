import mongoose from 'mongoose';

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        // minlength: [5, 'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH}).'],
    },
    // password: {
    //     type: String,
    //     required: true,
    //     minlength: [8, 'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH}).'],
    // },
    avatar: { type: String },
    _socketids: [],
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
})

//Write some encrption for Password
const User = mongoose.model('User', userSchema);
export default User;