import type { NextApiRequest, NextApiResponse } from 'next';
import { getQuestionByIdHandler, updateQuestionHandler, deleteQuestionHandler } from '../../../controllers/questionController';
import { authenticate } from '../../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await authenticate(getQuestionByIdHandler)(req, res);  // Authenticated users can get question by ID
  } else if (req.method === 'PUT') {
    await authenticate(updateQuestionHandler, true)(req, res);  // Admin only for updating
  } else if (req.method === 'DELETE') {
    await authenticate(deleteQuestionHandler, true)(req, res);  // Admin only for deleting
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
