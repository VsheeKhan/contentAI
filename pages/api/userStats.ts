import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserStatsHandler } from '../../controllers/userStatsController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authenticate(getUserStatsHandler, true)(req, res);
}
