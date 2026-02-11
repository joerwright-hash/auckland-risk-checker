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
import { toast } from "sonner";
import { 
  CreditCard, 
  Crown,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Download,
  Loader2,
  Clock,
  Zap,
  Shield,
  FileText,
  TrendingUp
} from "lucide-react";

interface PlanDetails {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limit: number | null;
}

const PLAN_DETAILS: Record<string, PlanDetails> = {
  free: {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    features: ["3 scans/month", "500 characters", "Basic risk report"],
    limit: 3,
  },
  starter: {
    name: "Starter",
    price: { monthly: 19, yearly: 15 },
    features: ["100 scans/month", "Unlimited characters", "PDF reports", "Email support"],
    limit: 100,
  },
  pro: {
    name: "Pro",
    price: { monthly: 49, yearly: 39 },
    features: ["Unlimited scans", "API access", "Team (5 users)", "Priority support"],
    limit: null,
  },
};

export default function BillingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState<string | null>(null);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");

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

        // Set user info
        const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        setUserName(displayName);
        const initials = displayName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || user.email?.[0].toUpperCase() || "U";
        setUserInitials(initials);

        // Fetch subscription
        const { data: subData, error: subError } = await getUserSubscription(user.id);
        if (subError) {
          console.error("Error fetching subscription:", subError);
        } else {
          setSubscription(subData);
          setIsYearly(subData?.billing_period === "yearly");
        }

        // Calculate scans remaining
        if (subData) {
          const plan = subData.plan || 'free';
          const { data: scans } = await getUserScans(user.id);
          
          const now = new Date();
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthlyScans = scans?.filter(
            (scan) => new Date(scan.created_at) >= thisMonthStart
          ) || [];

          const planLimits: Record<string, number> = {
            free: 3,
            starter: 100,
            pro: Infinity,
          };

          const limit = planLimits[plan] || 3;
          const remaining = limit === Infinity ? null : Math.max(0, limit - monthlyScans.length);
          setScansRemaining(remaining);
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast.error("Failed to load billing information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error opening portal:", error);
      toast.error(error.message || "Failed to open billing portal");
      setIsLoadingPortal(false);
    }
  };

  const handleUpgrade = async (plan: 'starter' | 'pro') => {
    setIsCreatingCheckout(plan);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan,
          billingPeriod: isYearly ? 'yearly' : 'monthly',
          cancelUrl: window.location.href, // Pass current page URL
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to start checkout. Please try again.');
      setIsCreatingCheckout(null);
    }
  };

  const plan = subscription?.plan || "free";
  const planDetails = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
  const isPaidPlan = plan !== "free";
  const isCanceled = subscription?.cancel_at_period_end === true;
  const isTrialing = subscription?.status === "trialing";

  const getRenewalDate = () => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end);
  };

  const getCancelDate = () => {
    if (!isCanceled || !subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end);
  };

  const renewalDate = getRenewalDate();
  const cancelDate = getCancelDate();

  const getStatusBadge = () => {
    if (isCanceled) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 text-warning text-sm font-medium rounded-full">
          <AlertTriangle className="w-4 h-4" />
          Canceling
        </span>
      );
    }
    if (isTrialing) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
          <Clock className="w-4 h-4" />
          Trial
        </span>
      );
    }
    if (subscription?.status === "active") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success text-sm font-medium rounded-full">
          <CheckCircle className="w-4 h-4" />
          Active
        </span>
      );
    }
    if (subscription?.status === "past_due") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-danger/10 text-danger text-sm font-medium rounded-full">
          <XCircle className="w-4 h-4" />
          Past Due
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900">
        <AppHeader
          creditsRemaining={scansRemaining ?? 0}
          userName={userName}
          userInitials={userInitials}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900">
      <AppHeader
        creditsRemaining={scansRemaining ?? 0}
        userName={userName}
        userInitials={userInitials}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Billing & Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription, payment methods, and billing information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Section */}
            <Card variant="elevated" className="shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Crown className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Current Plan</span>
                </h2>
                <div className="mb-6">
                  {getStatusBadge()}
                </div>
              </div>

              <div className="space-y-4">
                {/* Plan Info */}
                <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg border border-primary/20">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {planDetails.name} Plan
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isYearly 
                          ? `€${planDetails.price.yearly}` 
                          : `€${planDetails.price.monthly}`
                        }
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{isYearly ? "year" : "month"}
                      </span>
                      {isYearly && planDetails.price.yearly < planDetails.price.monthly * 12 && (
                        <span className="text-sm text-success font-medium">
                          Save {Math.round((1 - planDetails.price.yearly / (planDetails.price.monthly * 12)) * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {scansRemaining !== null
                        ? `${scansRemaining} scans remaining this month`
                        : "Unlimited scans"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {planDetails.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 text-xs font-medium text-gray-700 dark:text-gray-300 rounded"
                        >
                          <CheckCircle className="w-3 h-3 text-success" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subscription Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {renewalDate && !isCanceled && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isTrialing ? "Trial Ends" : "Renews On"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {renewalDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {cancelDate && isCanceled && (
                    <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <div>
                        <p className="text-sm font-medium text-warning">
                          Subscription Ends
                        </p>
                        <p className="text-sm text-warning/80">
                          {cancelDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {subscription?.billing_period && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Billing Period
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {subscription.billing_period}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  {isPaidPlan ? (
                    <>
                      {!isCanceled && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleManageSubscription}
                          isLoading={isLoadingPortal}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Manage Subscription
                        </Button>
                      )}
                      {isCanceled && (
                        <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            Your subscription will end on {cancelDate?.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}. You can reactivate it anytime before then.
                          </p>
                          <Button
                            variant="primary"
                            className="w-full"
                            onClick={handleManageSubscription}
                            isLoading={isLoadingPortal}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Reactivate Subscription
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/10 border border-primary/20 rounded-lg mb-4">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Compare All Plans
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Upgrade to unlock more features and increase your scan limits.{" "}
                              <a
                                href="/pricing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary-dark font-semibold underline underline-offset-2 transition-colors"
                              >
                                View full pricing details
                              </a>
                              <ArrowUpRight className="w-3 h-3 inline-block ml-1 text-primary" />
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleUpgrade('starter')}
                          isLoading={isCreatingCheckout === 'starter'}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade to Starter
                        </Button>
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => handleUpgrade('pro')}
                          isLoading={isCreatingCheckout === 'pro'}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Payment Method Section */}
            {isPaidPlan && (
              <Card variant="elevated" className="shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Payment Method
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Payment Method
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium mb-2">
                      •••• •••• •••• (Managed in Stripe Portal)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Update your payment method, view invoices, and manage billing details in the Stripe Customer Portal.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    isLoading={isLoadingPortal}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Payment Method
                  </Button>
                </div>
              </Card>
            )}

            {/* Billing History / Invoices */}
            {isPaidPlan && (
              <Card variant="elevated" className="shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Billing History
                  </h2>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and download your invoices from the Stripe Customer Portal. All invoices are also sent to your email address.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    isLoading={isLoadingPortal}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View Invoices
                  </Button>
                </div>
              </Card>
            )}

            {/* Available Plans (for upgrades) */}
            {isPaidPlan && plan !== 'pro' && (
              <Card variant="elevated" className="shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Upgrade Plan
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Compare All Plans
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Unlock more features by upgrading to a higher plan.{" "}
                          <a
                            href="/pricing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark font-semibold underline underline-offset-2 transition-colors"
                          >
                            View full pricing details
                          </a>
                          <ArrowUpRight className="w-3 h-3 inline-block ml-1 text-primary" />
                        </p>
                      </div>
                    </div>
                  </div>
                  {plan === 'free' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Starter Plan
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          €{isYearly ? planDetails.price.yearly : planDetails.price.monthly}
                          <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                            /{isYearly ? "year" : "month"}
                          </span>
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                          <li>• 100 scans/month</li>
                          <li>• Unlimited characters</li>
                          <li>• PDF reports</li>
                        </ul>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleUpgrade('starter')}
                          isLoading={isCreatingCheckout === 'starter'}
                        >
                          Upgrade to Starter
                        </Button>
                      </div>
                      <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Pro Plan
                          </h3>
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                            Popular
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          €{isYearly ? PLAN_DETAILS.pro.price.yearly : PLAN_DETAILS.pro.price.monthly}
                          <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                            /{isYearly ? "year" : "month"}
                          </span>
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                          <li>• Unlimited scans</li>
                          <li>• API access</li>
                          <li>• Team (5 users)</li>
                        </ul>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => handleUpgrade('pro')}
                          isLoading={isCreatingCheckout === 'pro'}
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  )}
                  {plan === 'starter' && (
                    <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Pro Plan
                        </h3>
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        €{isYearly ? PLAN_DETAILS.pro.price.yearly : PLAN_DETAILS.pro.price.monthly}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                          /{isYearly ? "year" : "month"}
                        </span>
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                        <li>• Unlimited scans</li>
                        <li>• API access</li>
                        <li>• Team (5 users)</li>
                        <li>• Priority support</li>
                      </ul>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleUpgrade('pro')}
                        isLoading={isCreatingCheckout === 'pro'}
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            <Card variant="elevated" className="shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {isPaidPlan && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleManageSubscription}
                    isLoading={isLoadingPortal}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing Portal
                  </Button>
                )}
                <a
                  href="/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View All Plans
                </a>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/app/settings")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </div>
            </Card>

            <Card variant="elevated" className="shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subscription Info
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Plan Status
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {subscription?.status || "Free"}
                  </p>
                </div>
                {subscription?.stripe_subscription_id && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Subscription ID
                    </p>
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                      {subscription.stripe_subscription_id.slice(0, 20)}...
                    </p>
                  </div>
                )}
                {subscription?.created_at && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Subscribed Since
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Date(subscription.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
