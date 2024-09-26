import { NextApiRequest, NextApiResponse } from 'next';
import { generateDigitalPersona } from '../services/openAIService';
import connectToDatabase from '../lib/mongodb'; // If you need to use the database

// Handler to generate digital persona
export async function generateDigitalPersonaHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { systemPrompt, queryPrompt } = req.body;

      // Validate input
      if (!systemPrompt || !queryPrompt) {
        return res.status(400).json({ message: 'systemPrompt and queryPrompt are required' });
      }

      // Generate the digital persona
      const persona = await generateDigitalPersona(systemPrompt, queryPrompt);

      // Send response
      res.status(200).json({ persona });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
