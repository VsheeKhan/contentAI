import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRegistrationCountHandler } from '../../controllers/userController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await getUserRegistrationCountHandler(req, res);
}
