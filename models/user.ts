// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  stripeClientId: string;
  password: string;
  userType?: number;
  profileImage?: string;
}

export enum userType {
  admin = 1,
  user = 2
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    stripeClientId: {
      type: String,
      required: true,
      default: ""
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: Number,
      required: true,
      enum: userType,
      default: userType.user
    },
    profileImage: {
      type: String,
      required: false,
      default: ""
    }
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
