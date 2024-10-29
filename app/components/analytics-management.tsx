"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatNumber } from "../utils/formattingUtils";
import { format } from "date-fns";

type SubscriptionData = {
  plan: string;
  subscriptions: number;
};

type UserSignUpData = {
  month: number;
  count: number;
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AnalyticsOverview() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalUsersPercentageChange, setTotalUsersPercentageChange] =
    useState<string>("0.00");
  const [activeTrialCount, setActiveTrialCount] = useState<number>(0);
  const [activeTrialPercentageChange, setActiveTrialPercentageChange] =
    useState<number>(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState<number>(0);
  const [activeSubsPercentageChange, setActiveSubsPercentageChange] =
    useState<number>(0);
  const [subscriptionData, setSubscriptionData] = useState<
    Array<SubscriptionData>
  >([]);
  const [userSignUpData, setUserSignUpData] = useState<Array<UserSignUpData>>(
    []
  );
  const [monthlyAIModelUsage, setMonthlyAIModelUsage] = useState<number>(0);
  const [
    monthlyAIModelUsagePercentageChange,
    setMonthlyAIModelUsagePercentageChange,
  ] = useState<number>(0);
  const [dailyAIModelUsage, setDailyAIModelUsage] = useState<
    { date: string; usage: number }[]
  >([]);

  useEffect(() => {
    fetchUserStats();
    fetchUserSignUpData();
    fetchAIModelMonthlyUsage();
    fetchAIModelDailyUsage();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await authFetch("/api/userStats");
      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }
      const data = await response.json();
      setTotalUsers(data.totalUserCount);
      setTotalUsersPercentageChange(data.percentageChange);
      setActiveTrialCount(data.trialUserCount);
      setActiveSubscriptions(data.nonTrialUserCount);
      setActiveTrialPercentageChange(data.planStats.trial.percentageChange);
      let activeSubsCurrentMonthUserCount = 0;
      let activeSubsLastMonthUserCount = 0;
      const subData: Array<SubscriptionData> = [];
      Object.keys(data.planStats).forEach((key) => {
        if (key !== "trial") {
          activeSubsCurrentMonthUserCount =
            +data.planStats[key].currentMonthUserCount;
          activeSubsLastMonthUserCount =
            +data.planStats[key].lastMonthUserCount;
          subData.push({
            plan: key,
            subscriptions: data.planStats[key].currentMonthUserCount,
          });
        }
      });
      if (activeSubsLastMonthUserCount > 0) {
        setActiveSubsPercentageChange(
          (activeSubsCurrentMonthUserCount - activeSubsLastMonthUserCount) /
            activeSubsLastMonthUserCount
        );
      }
      setSubscriptionData(subData);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchUserSignUpData = async () => {
    try {
      const response = await authFetch("/api/users-registration-count");
      if (!response.ok) {
        throw new Error("Failed to fetch users sign up data");
      }
      const data = await response.json();
      const signupData = data.map((item: UserSignUpData) => {
        return { month: months[item.month - 1], count: item.count };
      });
      setUserSignUpData(signupData);
    } catch (error) {
      console.error("Error fetching user signup data:", error);
    }
  };

  const fetchAIModelMonthlyUsage = async () => {
    try {
      const response = await authFetch("/api/tokens/monthly");
      if (!response.ok) {
        throw new Error("Failed to fetch AI model usage data");
      }
      const data = await response.json();
      setMonthlyAIModelUsage(data.currentMonthTokens);
      setMonthlyAIModelUsagePercentageChange(data.percentageChange);
    } catch (error) {
      console.error("Error fetching AI model usage data:", error);
    }
  };

  const fetchAIModelDailyUsage = async () => {
    try {
      const response = await authFetch("/api/tokens/daily?days=7");
      if (!response.ok) {
        throw new Error("Failed to fetch AI model daily usage data");
      }
      const data = await response.json();
      setDailyAIModelUsage(
        data.map((item: { _id: string; totalTokens: number }) => ({
          date: format(item._id, "d MMM"),
          usage: item.totalTokens,
        }))
      );
    } catch (err) {
      console.error("Error fetching AI model daily usage data:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{totalUsersPercentageChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +{activeSubsPercentageChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Model Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(monthlyAIModelUsage)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{monthlyAIModelUsagePercentageChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrialCount}</div>
            <p className="text-xs text-muted-foreground">
              +{activeTrialPercentageChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Signups Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userSignUpData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscriptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="subscriptions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>AI Model Usage by Day</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyAIModelUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
