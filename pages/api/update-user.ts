import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserRoleStatusAndPlanHandler } from '../../controllers/userController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await updateUserRoleStatusAndPlanHandler(req, res);
}
