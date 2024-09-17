import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { verifyToken } from '../utils/jwt';

export function authenticate(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Attach user data to the request object
      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({ message: 'Invalid token', error: error.message });
      } else {
        console.error('Unknown error during token verification:', error);
        return res.status(401).json({ message: 'Invalid token', error: 'Unknown error' });
      }
    }
  };
}
