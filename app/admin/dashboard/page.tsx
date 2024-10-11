"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, FileQuestion, CreditCard } from "lucide-react";
import AnalyticsOverview from "../../components/analytics-management";
import QuestionManagement from "../../components/question-management";
import ProtectedLayout from "@/app/layout/protected-layout";
import UserManagement from "../../components/user-management";
import FreeTrialMonitoring from "../../components/free-trial-monitoring";
import SubscriptionControl from "../../components/subscription-control";
import LogoutButton from "@/app/components/logout-button";

type TabTypes =
  | "analytics"
  | "questions"
  | "users"
  | "trials"
  | "subscriptions";
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabTypes>("analytics");

  return (
    <ProtectedLayout>
      <div className="container mx-auto p-6 h-full">
        <div className="flex justify-end">
          <LogoutButton />
        </div>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 w-full"
        >
          <TabsList className="w-full flex justify-evenly">
            <TabsTrigger value="analytics" className="flex-1">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex-1">
              <FileQuestion className="mr-2 h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="trials" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Free Trials
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex-1">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscriptions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="analytics">
            <AnalyticsOverview />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionManagement />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="trials">
            <FreeTrialMonitoring />
          </TabsContent>
          <TabsContent value="subscriptions">
            <SubscriptionControl />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}
