import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  content: string;
  topic: string;
  industry: string;
  tone: string;
  platform: string;
}

const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
    },
    tone: {
      type: String,
    },
    platform: {
      type: String,
    },
  },
  { timestamps: true }
);

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);
export default Post;
