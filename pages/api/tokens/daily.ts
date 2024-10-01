import type { NextApiRequest, NextApiResponse } from 'next';
import { getTokenUsageForDaysHandler } from '../../../controllers/tokenController';
import { authenticate } from '../../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authenticate(getTokenUsageForDaysHandler,true)(req, res);
}
