import type { NextApiRequest, NextApiResponse } from 'next';
import { createPostHandler, getPostsHandler } from '../../controllers/postController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await authenticate(createPostHandler)(req, res);
  } else if (req.method === 'GET') {
    await authenticate(getPostsHandler)(req, res);
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
