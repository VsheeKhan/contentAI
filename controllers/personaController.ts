import { NextApiRequest, NextApiResponse } from 'next';
import { generateDigitalPersona } from '../services/openAIService';
import connectToDatabase from '../lib/mongodb'; // If you need to use the database

// Handler to generate digital persona
export async function generateDigitalPersonaHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      connectToDatabase();
      const { queryPrompt } = req.body;
      if (!queryPrompt) {
        return res.status(400).json({ message: 'queryPrompt are required' });
      }
      const persona = await generateDigitalPersona(queryPrompt);
      res.status(200).json({ persona });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
