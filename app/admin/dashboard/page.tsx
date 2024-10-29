"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Users,
  FileQuestion,
  CreditCard,
  SquareTerminal,
  Menu,
} from "lucide-react";
import AnalyticsOverview from "../../components/analytics-management";
import QuestionManagement from "../../components/question-management";
import ProtectedLayout from "@/app/layout/protected-layout";
import UserManagement from "../../components/user-management";
import FreeTrialMonitoring from "../../components/free-trial-monitoring";
import SubscriptionControl from "../../components/subscription-control";
import LogoutButton from "@/app/components/logout-button";
import PromptManagement from "@/app/components/prompt-management";
import { Button } from "@/components/ui/button";

type TabTypes =
  | "analytics"
  | "questions"
  | "prompts"
  | "users"
  | "trials"
  | "subscriptions";
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabTypes>("analytics");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const tabItems = [
    { value: "analytics", label: "Analytics", icon: BarChart },
    { value: "questions", label: "Questions", icon: FileQuestion },
    { value: "prompts", label: "Prompts", icon: SquareTerminal },
    { value: "users", label: "Users", icon: Users },
    { value: "trials", label: "Free Trials", icon: Users },
    { value: "subscriptions", label: "Subscriptions", icon: CreditCard },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return <AnalyticsOverview />;
      case "questions":
        return <QuestionManagement />;
      case "prompts":
        return <PromptManagement />;
      case "users":
        return <UserManagement />;
      case "trials":
        return <FreeTrialMonitoring />;
      case "subscriptions":
        return <SubscriptionControl />;
      default:
        return null;
    }
  };

  return (
    <ProtectedLayout>
      <div className="container mx-auto p-6 h-full">
        <div className="flex justify-end">
          <LogoutButton />
        </div>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabTypes)}
          className="space-y-4 w-full"
        >
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mb-4">
                  <Menu className="mr-2 h-4 w-4" />
                  {tabItems.find((item) => item.value === activeTab)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {tabItems.map((item) => (
                  <DropdownMenuItem
                    key={item.value}
                    onSelect={() => setActiveTab(item.value as TabTypes)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2">
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center justify-center"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          <TabsContent value={activeTab}>{renderTabContent()}</TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}
