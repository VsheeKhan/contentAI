import type { NextApiRequest, NextApiResponse } from 'next';
import {terminateUserHandler} from '../../../controllers/userController';
  import { authenticate } from '../../../middlewares/authMiddleware';
  
  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
      await authenticate(terminateUserHandler, true)(req, res);
    } else {
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  