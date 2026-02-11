"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { createSupabaseClient } from "@/lib/supabase/client";
import { getUserSubscription, getUserUsageStats } from "@/lib/supabase/subscriptions";
import { getUserScans } from "@/lib/supabase/scans";
import { getCurrentUserInfo } from "@/lib/user-utils";
import { toast } from "sonner";
import { 
  Settings, 
  CreditCard, 
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface UsageChartData {
  date: string;
  day: number;
  scans: number;
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<{
    totalScansThisMonth: number;
    totalScansLast30Days: number;
    averageRiskScore: number;
    chartData: UsageChartData[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  
  // Load cached user info after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("userInfo");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            setUserName(parsed.userName);
            setUserInitials(parsed.userInitials);
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Get user display name and initials (will use cache if available)
        const userInfo = await getCurrentUserInfo();
        setUserName(userInfo.userName);
        setUserInitials(userInfo.userInitials);

        // Fetch subscription
        const { data: subData, error: subError } = await getUserSubscription(user.id);
        if (subError) {
          console.error("Error fetching subscription:", subError);
        } else {
          setSubscription(subData);
        }

        // Fetch usage stats
        const { data: usageData, error: usageError } = await getUserUsageStats(user.id);
        if (usageError) {
          console.error("Error fetching usage stats:", usageError);
        } else {
          setUsageStats(usageData);
        }

        // Use scans_remaining directly from database
        if (subData) {
          setScansRemaining(subData.scans_remaining);
        }
      } catch (error) {
        console.error("Error fetching settings data:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const plan = subscription?.plan || "free";

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900">
      <AppHeader
        activeTab="settings"
        creditsRemaining={scansRemaining ?? 0}
        userName={userName || "User"}
        userInitials={userInitials || "U"}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account, subscription, and preferences
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Usage Section - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Usage Section */}
              <Card variant="elevated" className="shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Usage</span>
                </h2>
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        This Month
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {usageStats?.totalScansThisMonth || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Last 30 Days
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {usageStats?.totalScansLast30Days || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Avg Risk Score
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {usageStats?.averageRiskScore || 0}%
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  {usageStats?.chartData && usageStats.chartData.length > 0 && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageStats.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="day"
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                            labelFormatter={(label) => `Day ${label}`}
                            formatter={(value: number | undefined) => [`${value ?? 0} scans`, "Scans"]}
                          />
                          <Bar
                            dataKey="scans"
                            fill="#4A6B5A"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <Card variant="elevated" className="shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/app")}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    New Scan
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/app/history")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/app/billing")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing & Subscription
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
