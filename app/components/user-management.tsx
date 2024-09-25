"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type PlanFilters = "all" | "basic" | "pro" | "enterprise";
type ActivityFilter = "all" | "active" | "inactive";

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      plan: "pro",
      activity: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      plan: "enterprise",
      activity: "inactive",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "user",
      plan: "basic",
      activity: "active",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<PlanFilters>("all");
  const [filterActivity, setFilterActivity] = useState<ActivityFilter>("all");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterPlan === "all" || user.plan === filterPlan) &&
      (filterActivity === "all" || user.activity === filterActivity)
  );

  const handleEditUser = (userId: number) => {
    // Implement edit user functionality
    console.log(`Editing user with ID: ${userId}`);
  };

  const handleGrantFreeAccess = (userId: number) => {
    // Implement grant free access functionality
    console.log(`Granting free access to user with ID: ${userId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={filterPlan}
          onValueChange={(value: PlanFilters) => setFilterPlan(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterActivity}
          onValueChange={(value: ActivityFilter) => setFilterActivity(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.plan}</TableCell>
              <TableCell>{user.activity}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => handleEditUser(user.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGrantFreeAccess(user.id)}
                >
                  Grant Free Access
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
