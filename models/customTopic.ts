import mongoose, { Schema, Document, Model } from 'mongoose';

interface ITopic extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  topics: string[];
}

const topicSchema: Schema<ITopic> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topics: {
      type: [String], // Array of strings for topics
      required: true,
    },
  },
  { timestamps: true }
);

const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', topicSchema);

export default Topic;
