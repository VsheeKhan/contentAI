"use client";

import { useState } from "react";
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

export default function SubscriptionControl() {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      user: "David Lee",
      plan: "Pro",
      status: "Active",
      nextBilling: "2023-07-15",
    },
    {
      id: 2,
      user: "Emma Watson",
      plan: "Basic",
      status: "Cancelled",
      nextBilling: "N/A",
    },
    {
      id: 3,
      user: "Frank Sinatra",
      plan: "Enterprise",
      status: "Active",
      nextBilling: "2023-08-01",
    },
  ]);

  const changePlan = (userId: number, newPlan: string) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === userId ? { ...sub, plan: newPlan } : sub
      )
    );
  };

  const openStripeManagement = (userId: number) => {
    // This function would typically open Stripe's customer management interface
    // For this example, we'll just log to the console
    console.log(`Opening Stripe management for user ID: ${userId}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Subscriptions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Current Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Billing Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>{sub.user}</TableCell>
              <TableCell>{sub.plan}</TableCell>
              <TableCell>{sub.status}</TableCell>
              <TableCell>{sub.nextBilling}</TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) => changePlan(sub.id, value)}
                  defaultValue={sub.plan}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="ml-2"
                  variant="outline"
                  onClick={() => openStripeManagement(sub.id)}
                >
                  Manage in Stripe
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
