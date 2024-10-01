import type { NextApiRequest, NextApiResponse } from 'next';
import { updatePostHandler, deletePostHandler } from '../../../controllers/postController';
import { authenticate } from '../../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    await authenticate(updatePostHandler)(req, res);
  } else if (req.method === 'DELETE') {
    await authenticate(deletePostHandler)(req, res);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
