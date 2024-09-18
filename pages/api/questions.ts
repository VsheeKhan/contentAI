import type { NextApiRequest, NextApiResponse } from 'next';
import { createQuestionHandler, getQuestionsHandler } from '../../controllers/questionController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await authenticate(createQuestionHandler, true)(req, res);  // Admin users can create
  } else if (req.method === 'GET') {
    await authenticate(getQuestionsHandler)(req, res);    // Authenticated users can get questions
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
