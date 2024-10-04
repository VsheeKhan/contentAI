import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePostHandler } from '../../controllers/postController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   await generatePostHandler(req, res);
await authenticate(generatePostHandler)(req, res)
}
