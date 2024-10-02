import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../lib/mongodb";
import {
  findUserByEmail,
  createUser,
  authenticateUser,
  getPaginatedUsers,
  getUsersByPlan,
  getUserRegistrationCountLast6Months,
  updateUserRoleStatusAndPlan,
} from "../services/userService";
import Plan from "../models/plan";
import { createSubscription } from "../services/subscriptionService";
import { generateToken } from "../utils/jwt";

type Data = {
  message: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
  token?: string;
  error?: string;
};

export default async function registerUser(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connectToDatabase();

  if (req.method === "POST") {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser: any = await createUser({ name, email, password });

      // Assign trial to the new user
      const freePlan: any = await Plan.findOne({ name: "trial" });
      if (!freePlan) {
        return res
          .status(500)
          .json({ message: "trial not found. Contact admin." });
      }

      // Create a subscription for the new user using the free plan
      await createSubscription({ userId: newUser._id, planId: freePlan._id });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function loginUser(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connectToDatabase();

  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      const user = await authenticateUser(email, password);
      // Generate JWT Token
      const token = generateToken(user);

      const response: Data = {
        message: "Login successful",
        name: user.name,
        email: user.email,
        token,
      };

      res.status(200).json(response);
    } catch (error: any) {
      res
        .status(401)
        .json({ message: "Invalid credentials", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getUserInfo(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "GET") {
    try {
      // Retrieve user data from the request object
      const { email } = req.user as { name: string; email: string };

      // Fetch user from the database
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user information
      res.status(200).json({ name: user.name, email: user.email });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getUsersHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectToDatabase();
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const result = await getPaginatedUsers(page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getUsersByPlanHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectToDatabase();
      const plan = req.query.plan as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      if (!plan) {
        return res.status(400).json({ message: "Plan name is required" });
      }
      const result = await getUsersByPlan(plan, page, limit);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

// Handler to get user registration count over the last 6 months
export async function getUserRegistrationCountHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectToDatabase();
      const registrationCounts = await getUserRegistrationCountLast6Months();
      res.status(200).json(registrationCounts);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

// Handler to update user role, status, and plan
export async function updateUserRoleStatusAndPlanHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    try {
      await connectToDatabase();
      const { userId, newUserType, newStatus, newPlanName } = req.body;

      if (
        !userId ||
        newUserType === undefined ||
        newStatus === undefined ||
        !newPlanName
      ) {
        return res.status(400).json({
          message:
            "userId, newUserType, newStatus, and newPlanName are required",
        });
      }
      const result = await updateUserRoleStatusAndPlan(
        userId,
        newUserType,
        newStatus,
        newPlanName
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
