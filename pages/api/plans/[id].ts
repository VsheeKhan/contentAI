import type { NextApiRequest, NextApiResponse } from 'next';
import {
    getPlanByIdHandler,
    updatePlanHandler,
    deletePlanHandler,
  } from '../../../controllers/planController';
  import { authenticate } from '../../../middlewares/authMiddleware';
  
  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
      await getPlanByIdHandler(req, res);
    } else if (req.method === 'PUT') {
      await authenticate(updatePlanHandler, true)(req, res);  // Only admins can update
    } else if (req.method === 'DELETE') {
      await authenticate(deletePlanHandler, true)(req, res);  // Only admins can delete
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  