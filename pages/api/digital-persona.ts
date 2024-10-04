import { NextApiRequest, NextApiResponse } from 'next/types';
import { addOrUpdateDigitalPersonaHandler, getDigitalPersonaHandler } from '../../controllers/digitalPersonaController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    await authenticate(addOrUpdateDigitalPersonaHandler)(req, res)
  } else if (req.method === 'GET') {
    await authenticate(getDigitalPersonaHandler)(req, res)
  } else {
    res.setHeader('Allow', ['PUT', 'GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
