import type { NextApiRequest, NextApiResponse } from 'next';
import { createPromptHandler } from '../../../controllers/promptController';
import { authenticate } from '../../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await authenticate(createPromptHandler, true)(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
