import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import User from '../models/user';
import Subscription from '../models/subscription';
import Plan from '../models/plan';
import { subMonths } from 'date-fns'; // To handle date calculations

export async function getUserStatsHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      // Get total user count
      const totalUserCount = await User.countDocuments();

      // Get the trial plan (assuming the Free Plan is considered the trial)
      const trialPlan = await Plan.findOne({ name: 'trial' });
      if (!trialPlan) {
        return res.status(500).json({ message: 'Free plan not found. Contact admin.' });
      }

      // Get trial user count
      const trialUserCount = await Subscription.countDocuments({ planId: trialPlan._id });

      // Get remaining (non-trial) user count
      const nonTrialUserCount = totalUserCount - trialUserCount;

      // Date calculations for current and previous month
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const lastMonthStart = subMonths(currentMonthStart, 1);

      const currentMonthUserCount = await User.countDocuments({
        createdAt: { $gte: currentMonthStart },
      });

      const lastMonthUserCount = await User.countDocuments({
        createdAt: { $gte: lastMonthStart, $lt: currentMonthStart },
      });

      // Calculate percentage comparison from last month
      let percentageChange = 0;
      if (lastMonthUserCount > 0) {
        percentageChange = ((currentMonthUserCount - lastMonthUserCount) / lastMonthUserCount) * 100;
      }

      // Plan-based statistics
      const plans = await Plan.find(); // Fetch all available plans
      const planStats:any = {};

      for (const plan of plans) {
        // Count users for the current month and the last month for each plan
        const currentMonthPlanUserCount = await Subscription.countDocuments({
          planId: plan._id,
          createdAt: { $gte: currentMonthStart },
        });

        const lastMonthPlanUserCount = await Subscription.countDocuments({
          planId: plan._id,
          createdAt: { $gte: lastMonthStart, $lt: currentMonthStart },
        });

        // Calculate percentage change for each plan
        let planPercentageChange = 0;
        if (lastMonthPlanUserCount > 0) {
          planPercentageChange = ((currentMonthPlanUserCount - lastMonthPlanUserCount) / lastMonthPlanUserCount) * 100;
        }

        planStats[plan.name] = {
          currentMonthUserCount: currentMonthPlanUserCount,
          lastMonthUserCount: lastMonthPlanUserCount,
          percentageChange: planPercentageChange.toFixed(2),
        };
      }

      res.status(200).json({
        totalUserCount,
        trialUserCount,
        nonTrialUserCount,
        percentageChange: percentageChange.toFixed(2),
        planStats,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
