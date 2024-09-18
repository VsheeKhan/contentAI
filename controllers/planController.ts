import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from '../services/planService';

export async function createPlanHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      const { name, description, amount, duration, status } = req.body;

      const newPlan = await createPlan({ name, description, amount, duration, status });

      res.status(201).json(newPlan);
    } catch (error) {
      res.status(400).json({ message: 'Error creating plan', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getPlansHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const plans = await getPlans();
      res.status(200).json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving plans', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getPlanByIdHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { id } = req.query;

    try {
      const plan = await getPlanById(id as string);

      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      res.status(200).json(plan);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving plan', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function updatePlanHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'PUT') {
    const { id } = req.query;

    try {
      const updatedPlan = await updatePlan(id as string, req.body);

      if (!updatedPlan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      res.status(200).json(updatedPlan);
    } catch (error) {
      res.status(400).json({ message: 'Error updating plan', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function deletePlanHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      const deletedPlan = await deletePlan(id as string);

      if (!deletedPlan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting plan', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
