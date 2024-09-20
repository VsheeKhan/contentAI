import type { NextApiRequest, NextApiResponse } from 'next';
import { createPlanHandler, getPlansHandler } from '../../controllers/planController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await authenticate(createPlanHandler, true)(req, res);  // Only admins can create plans
  } else if (req.method === 'GET') {
    await getPlansHandler(req, res);  // Anyone can get the list of plans
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
