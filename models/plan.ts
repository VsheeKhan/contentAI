import mongoose, { Schema, Document, Model } from 'mongoose';

interface IPlan extends Document {
  name: string;
  description: string;
  amount: number;
  duration: string;
  status: planTypes.active |  planTypes.inactive;
}

enum planTypes {
    active = 1,
    inactive = 2
}

const planSchema: Schema<IPlan> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      enum: planTypes,
      default: planTypes.active,
    },
  },
  {
    timestamps: true,
  }
);

const Plan: Model<IPlan> = mongoose.models.Plan || mongoose.model<IPlan>('Plan', planSchema);

export default Plan;
