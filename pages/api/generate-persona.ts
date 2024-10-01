import type { NextApiRequest, NextApiResponse } from 'next';
import { generateDigitalPersonaHandler } from '../../controllers/personaController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await generateDigitalPersonaHandler(req, res);
}
