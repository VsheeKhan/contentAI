"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { authFetch } from "../utils/authFetch";

type Status = "active" | "inactive";

type SubscribedUsers = {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: Status;
  nextBillingDate: Date;
};
export default function SubscriptionControl() {
  const [subscribedUsers, setSubscribedUsers] = useState<
    Array<SubscribedUsers>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribedUsers();
  }, []);

  const fetchSubscribedUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/users-by-plan?plan=pro");
      if (!response.ok) {
        throw new Error("Failed to fetch all users by plan");
      }
      const data = await response.json();

      const usersData: Array<SubscribedUsers> = data.users.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.subscription.plan,
        status: user.subscription.status === 1 ? "active" : "inactive",
        nextBillingDate: new Date(user.subscription.endDateTime),
      }));
      setSubscribedUsers(usersData);
    } catch (error) {
      setError(
        "An error occurred while fetching all users by plan. Please try again later."
      );
      console.error("Error fetching users by plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changePlan = (userId: string, newPlan: string) => {
    setSubscribedUsers(
      subscribedUsers.map((sub) =>
        sub.id === userId ? { ...sub, plan: newPlan } : sub
      )
    );
  };

  const openStripeManagement = (userId: string) => {
    // This function would typically open Stripe's customer management interface
    // For this example, we'll just log to the console
    console.log(`Opening Stripe management for user ID: ${userId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Name</TableHead>
            <TableHead className="w-[20%]">Email</TableHead>
            <TableHead className="w-[10%]">Current Plan</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
            <TableHead className="w-[10%]">Next Billing Date</TableHead>
            <TableHead className="w-[30%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribedUsers.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>{sub.name}</TableCell>
              <TableCell>{sub.email}</TableCell>
              <TableCell>{sub.plan}</TableCell>
              <TableCell>{sub.status}</TableCell>
              <TableCell>{sub.nextBillingDate.toDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Select
                    onValueChange={(value) => changePlan(sub.id, value)}
                    defaultValue={sub.plan}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="ml-2"
                    variant="outline"
                    onClick={() => openStripeManagement(sub.id)}
                  >
                    Manage in Stripe
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
