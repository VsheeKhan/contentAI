import { NextApiRequest, NextApiResponse } from 'next';
import { getMonthlyTokenUsage, getTokenUsageForDays } from '../services/tokenService';
import connectToDatabase from '../lib/mongodb';

// Handler for monthly token usage with comparison to last month
export async function getMonthlyTokenUsageHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      const usageData = await getMonthlyTokenUsage();
      res.status(200).json(usageData);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

// Handler for token usage for the last n days
export async function getTokenUsageForDaysHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      const { days } = req.query;
      const numDays = parseInt(days as string, 10);
      
      if (isNaN(numDays) || numDays <= 0) {
        return res.status(400).json({ message: 'Invalid number of days' });
      }

      const usageData = await getTokenUsageForDays(numDays);
      res.status(200).json(usageData);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
