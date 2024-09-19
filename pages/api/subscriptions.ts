import type { NextApiRequest, NextApiResponse } from 'next';
import { createSubscriptionHandler } from '../../controllers/subscriptionController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await createSubscriptionHandler(req, res);  // No admin authentication needed for creating subscription
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
