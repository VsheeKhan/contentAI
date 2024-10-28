"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  PenLine,
  FileText,
  LogOut,
  Loader2,
  Settings,
  CalendarIcon,
  Menu,
} from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { authFetch } from "@/app/utils/authFetch";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const initializeLayout = async () => {
      try {
        await getSubscriptionStatus();
      } catch (err) {
        console.error("Error initializing layout:", err);
        setError("An error occurred while loading the page. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeLayout();
  }, []);

  const getSubscriptionStatus = async () => {
    try {
      const response = await authFetch("/api/subscription-status");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }
      const data = await response.json();
      setSubscriptionStatus(data.status);
    } catch (err) {
      console.error("Error fetching subscription status", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => setError(null)}>Dismiss</Button>
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Mobile menu button */}
      <div className="md:hidden p-4 bg-white">
        <Button variant="ghost" onClick={toggleMobileMenu}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      {/* Sidebar */}
      <div
        className={`bg-white shadow-md ${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block md:w-64`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <span
              className={`w-8 h-8 rounded-md mr-2 flex items-center justify-center overflow-hidden ${
                !user?.profileImage || user.profileImage.length === 0
                  ? "bg-pink-500"
                  : ""
              }`}
            >
              {user?.profileImage && user.profileImage.length > 0 ? (
                <Image
                  src={user.profileImage}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </span>
            {user?.name}
          </h2>
        </div>
        <nav className="p-4">
          <Link href="/home/generate" passHref>
            <Button
              variant={pathname === "/home/generate" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PenLine className="mr-2 h-4 w-4" /> Generate Post
            </Button>
          </Link>
          <Link href="/home/posts" passHref>
            <Button
              variant={pathname === "/home/posts" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText className="mr-2 h-4 w-4" /> Posts
            </Button>
          </Link>
          <Link href="/home/calendar" passHref>
            <Button
              variant={pathname === "/home/calendar" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
            </Button>
          </Link>
          <Link href="/home/settings" passHref>
            <Button
              variant={pathname === "/home/settings" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 pb-3 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold mb-4 md:mb-0">
            {pathname === "/home/generate"
              ? "Generate Post"
              : pathname === "/home/posts"
              ? "Posts"
              : pathname === "/home/calendar"
              ? "Calendar"
              : pathname === "/home/settings"
              ? "Settings"
              : "Subscribe"}
          </h1>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
            {
              // Show the free trial badge and upgrade button if the user is on a free trial and hasn't expired
            }
            {subscriptionStatus !== "active" &&
              subscriptionStatus !== "canceled" &&
              !user?.hasExpired && (
                <>
                  <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Free Trial
                  </div>
                  <Button
                    variant="default"
                    className="bg-pink-500 hover:bg-pink-600 w-full md:w-auto"
                    onClick={() => router.push("/home/subscribe")}
                  >
                    Upgrade to Pro
                  </Button>
                </>
              )}
            {
              // Show the upgrade button if the user is on a free trial and has expired
            }
            {subscriptionStatus !== "active" &&
              subscriptionStatus !== "canceled" &&
              user?.hasExpired && (
                <Button
                  variant="default"
                  className="bg-pink-500 hover:bg-pink-600 w-full md:w-auto"
                  onClick={() => router.push("/home/subscribe")}
                >
                  Upgrade to Pro
                </Button>
              )}
            {
              // Show the upgrade button if the user is on a paid pro plan and has not expired
            }
            {subscriptionStatus === "active" && !user?.hasExpired && (
              <Button
                variant="default"
                className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-pink-600 w-full md:w-auto"
                onClick={() => router.push("/home/subscribe?plan=pro")}
              >
                Upgraded to Pro
              </Button>
            )}
            {
              // Show the upgrade button if the user is on a paid pro plan and has expired
            }
            {subscriptionStatus === "active" && user?.hasExpired && (
              <Button
                variant="default"
                className="bg-pink-500 hover:bg-pink-600 w-full md:w-auto"
                onClick={() => router.push("/home/subscribe")}
              >
                Upgrade to Pro
              </Button>
            )}
            {
              // Show the upgrade button if the user is on an active paid pro plan and has canceled
            }
            {subscriptionStatus === "canceled" && !user?.hasExpired && (
              <Button
                variant="default"
                className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-pink-600 w-full md:w-auto"
                onClick={() =>
                  router.push("/home/subscribe?plan=pro&status=cancelled")
                }
              >
                Active but Cancelled
              </Button>
            )}
            {
              // Show the upgrade button if the user is a paid pro plan and has canceled and expired
            }
            {subscriptionStatus === "canceled" && user?.hasExpired && (
              <Button
                variant="default"
                className="bg-pink-500 hover:bg-pink-600 w-full md:w-auto"
                onClick={() => router.push("/home/subscribe")}
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
        </header>
        <main className="p-6 space-y-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
