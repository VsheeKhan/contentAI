import jwt from "jsonwebtoken";
import { userType } from "@/models/user";

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret_key";

export function generateToken(user: any) {
  const userId = user._id;
  const name = user.name;
  const email = user.email;
  const isAdmin = user.userType === userType.admin ? true : false;
  const payload = {
    userId,
    name,
    email,
    isAdmin,
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" }); // Token expires in 1 hour
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}
