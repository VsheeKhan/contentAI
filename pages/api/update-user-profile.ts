import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserProfileHandler } from '../../controllers/userProfile';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authenticate(updateUserProfileHandler)(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
