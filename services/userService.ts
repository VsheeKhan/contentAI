import User from "../models/user";
import bcrypt from "bcryptjs";

interface UserInput {
  name: string;
  email: string;
  password: string;
}

export async function findUserByEmail(email: string) {
  return await User.findOne({ email });
}

export async function createUser({ name, email, password }: UserInput) {
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create and save the new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  return newUser;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return user;
}
