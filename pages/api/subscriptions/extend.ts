import type { NextApiRequest, NextApiResponse } from 'next';
import { extendSubscriptionHandler } from '../../../controllers/subscriptionController';
import { authenticate } from '../../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    await authenticate(extendSubscriptionHandler, true)(req, res);  // Only admin can extend
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
