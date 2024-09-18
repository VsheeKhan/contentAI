import mongoose, { Schema, Document, Model } from 'mongoose';

export type QuestionType = 'text' | 'radio' | 'mcq' | 'single_choice';

export enum questionStatus {
    active = 1,
    inactive = 2
}

interface IQuestion extends Document {
  questionType: QuestionType;
  question: string;
  options?: Record<string, any>;  // Storing options as a JSON object
  status: questionStatus.active | questionStatus.inactive ;
}

const questionSchema: Schema<IQuestion> = new Schema(
  {
    questionType: {
      type: String,
      enum: ['text', 'radio', 'mcq', 'single_choice'],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      required: function (this: IQuestion) {
        return this.questionType !== 'text';
      },
    },
    status: {
      type: Number,
      enum: questionStatus,
      default: questionStatus.active,
    },
  },
  {
    timestamps: true,
  }
);

const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
