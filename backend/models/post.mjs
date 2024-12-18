import mongoose from "mongoose";
import pkg from 'mongoose';
const {Schema} = pkg;



const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);



const Post = mongoose.model('Post', postSchema);
export default Post;
