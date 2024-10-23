import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllPromptHandler } from '../../../controllers/promptController';
import { authenticate } from '../../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await authenticate(getAllPromptHandler, true)(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
