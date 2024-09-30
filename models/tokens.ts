import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  tokens: { type: Number, required: true },
  cost: {type: Number, required: true},
},
{
  timestamps: true,
});

const Token = mongoose.models.Token || mongoose.model("Token", TokenSchema);

export default Token;
