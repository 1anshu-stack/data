import mongoose from "mongoose";
import pkg from 'mongoose';
const {Schema} = pkg;



const userSchema = new Schema({
    email: {
        type: String,
        required: true // Corrected "require" to "required"
    },
    password: {
        type: String,
        required: true // Corrected "require" to "required"
    },
    name: {
        type: String,
        required: true // Corrected "require" to "required"
    },
    status: {
        type: String,
        default: 'I am new!'
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
}, { timestamps: true });



const User = mongoose.model('User', userSchema);
export default User;