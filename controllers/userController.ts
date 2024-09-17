import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import { findUserByEmail, createUser, authenticateUser } from '../services/userService';
import { generateToken } from '../utils/jwt';

type Data = {
  message: string;
  name?: string;
  email?: string;
  token?: string;
  error?: string;
};

export default async function registerUser(req: NextApiRequest, res: NextApiResponse<Data>) {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      await createUser({ name, email, password });
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function loginUser(req: NextApiRequest, res: NextApiResponse<Data>) {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = await authenticateUser(email, password);

      // Generate JWT Token
      const token = generateToken({ name: user.name, email: user.email });

      res.status(200).json({
        message: 'Login successful',
        name: user.name,
        email: user.email,
        token,
      });
    } catch (error: any) {
      res.status(401).json({ message: 'Invalid credentials', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getUserInfo(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();
  
    if (req.method === 'GET') {
      try {
        // Retrieve user data from the request object
        const { email } = req.user as { name: string; email: string }; // Add any other fields as needed
  
        // Fetch user from the database
        const user = await findUserByEmail(email);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        // Return user information
        res.status(200).json({ name: user.name, email: user.email });
      } catch (error: any) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
