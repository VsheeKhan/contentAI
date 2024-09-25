import User from "../models/user";
import Subscription from "../models/subscription";
import Plan from "../models/plan";
import { differenceInDays } from "date-fns";
import bcrypt from "bcryptjs";

interface UserInput {
  name: string;
  email: string;
  password: string;
}

export async function findUserByEmail(email: string) {
  return await User.findOne({ email });
}

export async function createUser({ name, email, password }: UserInput) {
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create and save the new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  return newUser;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return user;
}

export async function getPaginatedUsers(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const totalUsers = await User.countDocuments();
  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .select("-password")
    .lean(); // Exclude password field

  // Fetch subscription and plan information for each user
  const usersWithPlans = await Promise.all(
    users.map(async (user: any) => {
      // Get the user's subscription
      const subscription: any = await Subscription.findOne({ userId: user._id })
        .populate("planId")
        .lean();

      // Calculate remaining days
      let remainingDays: any = null;
      if (subscription) {
        const currentDate = new Date();
        remainingDays = differenceInDays(
          new Date(subscription.endDateTime),
          currentDate
        );
      }

      // Include subscription and plan info in the user object
      return {
        ...user,
        status: user.isActive ? "active" : "inactive", // Assuming user has a field 'isActive'
        subscription: subscription
          ? {
              plan: subscription.planId.name, // Assuming 'name' field in Plan
              startDateTime: subscription.startDateTime,
              endDateTime: subscription.endDateTime,
              status: subscription.status,
              remainingDays: remainingDays >= 0 ? remainingDays : 0, // If remaining days is negative, set to 0
            }
          : null, // If no subscription found
      };
    })
  );

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users: usersWithPlans,
    totalUsers,
    totalPages,
    currentPage: page,
    limit,
  };
}

export async function getUsersByPlan(
  planName: string,
  page: number,
  limit: number
) {
  // Fetch the specified plan
  const plan = await Plan.findOne({ name: planName });

  if (!plan) {
    throw new Error(`Plan "${planName}" not found`);
  }

  // Pagination setup
  const skip = (page - 1) * limit;

  // Find all users subscribed to the specified plan
  const subscriptions = await Subscription.find({ planId: plan._id })
    .populate("userId")
    .skip(skip)
    .limit(limit)
    .lean();

  // Get the total number of subscriptions for this plan (for pagination metadata)
  const totalUsers = await Subscription.countDocuments({ planId: plan._id });

  // Map through subscriptions and return user data with their plan info, excluding password and returning userType as "admin" or "user"
  const usersWithPlan = subscriptions.map((subscription) => {
    const user: any = { ...subscription.userId };
    delete user.password; // Remove password field from user data

    // Calculate the days left in the subscription
    const daysLeft = differenceInDays(
      new Date(subscription.endDateTime),
      new Date()
    );

    // Map userType to "admin" or "user"
    const userTypeString = user.userType === 1 ? "admin" : "user";

    return {
      ...user, // Spread user info
      userType: userTypeString, // Convert userType to string
      subscription: {
        plan: plan.name,
        startDateTime: subscription.startDateTime,
        endDateTime: subscription.endDateTime,
        daysLeft: daysLeft >= 0 ? daysLeft : 0, // Return 0 if the days left is negative
      },
    };
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users: usersWithPlan,
    totalUsers,
    totalPages,
    currentPage: page,
    limit,
  };
}
