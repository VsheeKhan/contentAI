"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import { capitalize } from "../utils/formattingUtils";
import { PlanInfo, UserInfo } from "../admin/dashboard/page";

type Status = "active" | "inactive";
type Role = "admin" | "user";
type StatusFilter = "all" | Status;
type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  plan: string;
  status: Status;
  subscriptionId: string;
  freeAccess: boolean;
};

export default function UserManagement() {
  const [users, setUsers] = useState<Array<User>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  useEffect(() => {
    fetchAllUsers();
    fetchAllPlans();
  }, []);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/get-all-users");
      if (!response.ok) {
        throw new Error("Failed to fetch all users");
      }
      const data = await response.json();

      const usersData: Array<User> = data.users.map((user: UserInfo) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.subscription.status === 1 ? "active" : "inactive",
        role: user.userType === 1 ? "admin" : "user",
        plan: user.subscription ? user.subscription.plan : "trial",
        subscriptionId: user.subscription ? user.subscription.id : null,
        freeAccess:
          user.subscription &&
          new Date(user.subscription.endDateTime).getFullYear() === 9999
            ? true
            : false,
      }));
      setUsers(usersData);
    } catch (error) {
      setError(
        "An error occurred while fetching all users. Please try again later."
      );
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPlans = async () => {
    setError(null);
    try {
      const response = await authFetch("/api/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch all plans");
      }
      const data = await response.json();
      setPlans(data.map((plan: PlanInfo) => plan.name));
    } catch (error) {
      setError(
        "An error occurred while fetching all plans. Please try again later."
      );
      console.error("Error fetching plans:", error);
    }
  };

  const handleEditUser = (user: User) => {
    setError(null);
    setEditingUser(user);
    if (!expandedRows.includes(user.id)) {
      setExpandedRows([...expandedRows, user.id]);
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setError(null);
    try {
      const response = await authFetch("/api/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: editingUser.id,
          newUserType: editingUser.role === "admin" ? 1 : 2,
          newPlanName: editingUser.plan,
          newStatus: editingUser.status === "active" ? 1 : 2,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...editingUser,
              }
            : user
        )
      );
      setEditingUser(null);
    } catch (error) {
      setError(
        "An error occurred while updating user data. Please try again later."
      );
      console.error("Error updating user:", error);
    }
  };

  const handleCancelEdit = () => {
    setError(null);
    setEditingUser(null);
  };

  const handleGrantFreeAccess = async (user: User) => {
    setError(null);
    if (!user.subscriptionId) {
      setError("Cannot grant free access: User has no active subscription");
      return;
    }
    try {
      const response = await authFetch("/api/subscriptions/max", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: user.subscriptionId,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to grant free access to user ${user.name}`);
      }
      // const updatedSubscription = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((userItem) =>
          user.id === userItem.id ? { ...userItem, freeAccess: true } : userItem
        )
      );
    } catch (error) {
      setError(
        "An error occurred while granting free access. Please try again later."
      );
      console.error("Error granting free access:", error);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterPlan === "all" || user.plan === filterPlan) &&
        (filterStatus === "all" || user.status === filterStatus)
    );
  }, [users, searchTerm, filterPlan, filterStatus]);

  const toggleRowExpansion = (userId: string) => {
    setExpandedRows(
      expandedRows.includes(userId)
        ? expandedRows.filter((id) => id !== userId)
        : [...expandedRows, userId]
    );
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
      <div className="flex w-full space-x-2">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => {
            setError(null);
            setSearchTerm(e.target.value);
          }}
          className="max-w-sm flex-1"
        />
        <Select
          value={filterPlan}
          onValueChange={(value: string) => {
            setError(null);
            setFilterPlan(value);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {capitalize(plan)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(value: StatusFilter) => {
            setError(null);
            setFilterStatus(value);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">Plan</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Free Access
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <>
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <span className="mr-2">{user.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6 rounded-full md:hidden"
                      onClick={() => toggleRowExpansion(user.id)}
                    >
                      {expandedRows.includes(user.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {editingUser?.id === user.id ? (
                      <Select
                        value={editingUser.role}
                        onValueChange={(value: Role) =>
                          setEditingUser({ ...editingUser, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      capitalize(user.role)
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {editingUser?.id === user.id ? (
                      <Select
                        value={editingUser.plan}
                        onValueChange={(value: string) =>
                          setEditingUser({ ...editingUser, plan: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan} value={plan}>
                              {capitalize(plan)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      capitalize(user.plan)
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {editingUser?.id === user.id ? (
                      <Select
                        value={editingUser.status}
                        onValueChange={(value: Status) =>
                          setEditingUser({ ...editingUser, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      capitalize(user.status)
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.freeAccess ? (
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        <span>Granted</span>
                      </div>
                    ) : (
                      "Not Granted"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser?.id === user.id ? (
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button
                          variant="outline"
                          className="mr-2"
                          onClick={handleSaveUser}
                        >
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleGrantFreeAccess(user)}
                          disabled={user.freeAccess}
                        >
                          Grant Free Access
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
                {expandedRows.includes(user.id) && (
                  <TableRow className="md:hidden">
                    <TableCell colSpan={7}>
                      <div className="py-2 space-y-2">
                        <p>
                          <strong>Email:</strong> {user.email}
                        </p>
                        <div>
                          <strong>Role:</strong>
                          {editingUser?.id === user.id ? (
                            <Select
                              value={editingUser.role}
                              onValueChange={(value: Role) =>
                                setEditingUser({ ...editingUser, role: value })
                              }
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="ml-1">
                              {capitalize(user.role)}
                            </span>
                          )}
                        </div>
                        <div>
                          <strong>Plan:</strong>
                          {editingUser?.id === user.id ? (
                            <Select
                              value={editingUser.plan}
                              onValueChange={(value: string) =>
                                setEditingUser({ ...editingUser, plan: value })
                              }
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map((plan) => (
                                  <SelectItem key={plan} value={plan}>
                                    {capitalize(plan)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="ml-1">
                              {capitalize(user.plan)}
                            </span>
                          )}
                        </div>
                        <div>
                          <strong>Status:</strong>
                          {editingUser?.id === user.id ? (
                            <Select
                              value={editingUser.status}
                              onValueChange={(value: Status) =>
                                setEditingUser({
                                  ...editingUser,
                                  status: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="ml-1">
                              {capitalize(user.status)}
                            </span>
                          )}
                        </div>
                        <p>
                          <strong>Free Access:</strong>
                          <span className="ml-1">
                            {user.freeAccess ? "Granted" : "Not Granted"}
                          </span>
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
