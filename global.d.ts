// global.d.ts
import mongoose from "mongoose";
// global.d.ts
import { JwtPayload } from "jsonwebtoken";

declare module "next" {
  interface NextApiRequest {
    user?: JwtPayload | string; // Adjust the type based on your JWT payload structure
  }
}

declare global {
  const mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}
