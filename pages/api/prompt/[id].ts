import type { NextApiRequest, NextApiResponse } from 'next';
import { updatePromptHandler } from '../../../controllers/promptController';
  import { authenticate } from '../../../middlewares/authMiddleware';
  
  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
      await authenticate(updatePromptHandler, true)(req, res);  // Only admins can update
    } else {
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  