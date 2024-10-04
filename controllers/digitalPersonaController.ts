import { NextApiRequest, NextApiResponse } from 'next';
import { addOrUpdateDigitalPersona, getDigitalPersonaByUserId } from '../services/digitalPersonaService';
import connectToDatabase from '../lib/mongodb';

// Handler to add or update the digital persona for a user
export async function addOrUpdateDigitalPersonaHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      await connectToDatabase();
      const { userId } = req.user as { userId: string }; // Get only userId from the user object
  
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized, no userId found in token' });
        }
      const { personaData } = req.body;
      if (!personaData) {
        return res.status(400).json({ message: 'personaData are required' });
      }
      const result = await addOrUpdateDigitalPersona(userId, personaData);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getDigitalPersonaHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
      try {
        await connectToDatabase();
        const { userId } = req.user as { userId: string }; // Get only userId from the user object
  
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized, no userId found in token' });
        }
        const digitalPersona = await getDigitalPersonaByUserId(userId); // Pass the userId directly
        res.status(200).json(digitalPersona);
      } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  }
