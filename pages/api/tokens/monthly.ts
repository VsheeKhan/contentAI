import type { NextApiRequest, NextApiResponse } from 'next';
import { getMonthlyTokenUsageHandler } from '../../../controllers/tokenController';
import { authenticate } from '../../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authenticate(getMonthlyTokenUsageHandler,true)(req, res);
}
