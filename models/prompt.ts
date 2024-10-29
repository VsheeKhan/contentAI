import mongoose, { Schema, Document, Model } from "mongoose";

export type PromptType = "system" | "user";

interface IPrompt extends Document {
  sortIndex: number;
  type: PromptType;
  name: string;
  prompt?: string;
}

const promptSchema: Schema<IPrompt> = new Schema({
  sortIndex: {
      type: Number,
      required: false,
    },
    type: {
      type: String,
      enum: ["system", "user"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
    },
},
  {
    timestamps: true,
  }
);

const Prompt: Model<IPrompt> =
  mongoose.models.Prompt ||
  mongoose.model<IPrompt>("Prompt", promptSchema);

export default Prompt;