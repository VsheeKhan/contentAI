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
import { Progress } from "@/components/ui/progress";

export default function FreeTrialMonitoring() {
  const [trialUsers, setTrialUsers] = useState([
    {
      id: 1,
      name: "Alice Cooper",
      email: "alice@example.com",
      daysLeft: 7,
      engagement: 75,
    },
    {
      id: 2,
      name: "Bob Dylan",
      email: "bob@example.com",
      daysLeft: 3,
      engagement: 45,
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie@example.com",
      daysLeft: 10,
      engagement: 90,
    },
  ]);

  const extendTrial = (userId: number) => {
    setTrialUsers(
      trialUsers.map((user) =>
        user.id === userId ? { ...user, daysLeft: user.daysLeft + 7 } : user
      )
    );
  };

  const terminateTrial = (userId: number) => {
    setTrialUsers(trialUsers.filter((user) => user.id !== userId));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Users on Free Trial</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead>Engagement</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trialUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.daysLeft}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Progress value={user.engagement} className="w-[60%] mr-2" />
                  <span>{user.engagement}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => extendTrial(user.id)}
                  variant="outline"
                  className="mr-2"
                >
                  Extend Trial
                </Button>
                <Button
                  onClick={() => terminateTrial(user.id)}
                  variant="destructive"
                >
                  Terminate Trial
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
