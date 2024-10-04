import mongoose, { Schema, Document, Model } from 'mongoose';

interface IDigitalPersona extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  personaData: string; // Digital persona stored as a string
}

const digitalPersonaSchema: Schema<IDigitalPersona> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // Ensure each user has only one digital persona
    },
    personaData: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const DigitalPersona: Model<IDigitalPersona> =
  mongoose.models.DigitalPersona || mongoose.model<IDigitalPersona>('DigitalPersona', digitalPersonaSchema);

export default DigitalPersona;
