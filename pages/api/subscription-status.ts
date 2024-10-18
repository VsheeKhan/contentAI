import { NextApiRequest, NextApiResponse } from 'next/types';
import { subscriptionStatusHandler } from '../../controllers/subscriptionStatusController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await authenticate(subscriptionStatusHandler)(req, res)
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
