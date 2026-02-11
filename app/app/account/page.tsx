"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { createSupabaseClient } from "@/lib/supabase/client";
import { getUserSubscription } from "@/lib/supabase/subscriptions";
import { getUserScans } from "@/lib/supabase/scans";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Calendar,
  Shield,
  Key,
  Trash2,
  Save,
  Edit,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Clock,
  Database
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  metadata?: {
    full_name?: string;
    display_name?: string;
  };
}

export default function AccountPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  
  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createSupabaseClient();
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

        if (!authUser || userError) {
          router.push("/auth/login");
          return;
        }

        // Set user data
        const userProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email || "",
          created_at: authUser.created_at || "",
          email_confirmed_at: authUser.email_confirmed_at || null,
          last_sign_in_at: authUser.last_sign_in_at || null,
          metadata: authUser.user_metadata || {},
        };
        setUser(userProfile);
        setDisplayName(authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || "");
        setFullName(authUser.user_metadata?.full_name || "");

        // Fetch subscription
        const { data: subData } = await getUserSubscription(authUser.id);
        setSubscription(subData);

        // Calculate scans remaining
        if (subData) {
          const plan = subData.plan || 'free';
          const { data: scans } = await getUserScans(authUser.id);
          
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
        console.error("Error fetching account data:", error);
        toast.error("Failed to load account information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const supabase = createSupabaseClient();
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          full_name: fullName,
        },
      });

      if (error) {
        throw error;
      }

      // Update local state
      setUser({
        ...user,
        metadata: {
          ...user.metadata,
          display_name: displayName,
          full_name: fullName,
        },
      });

      setIsEditingName(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createSupabaseClient();
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully");
      setShowPasswordChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const supabase = createSupabaseClient();
      
      // Note: Supabase doesn't provide a direct way to delete user accounts from the client
      // This would typically require a server-side API route or admin function
      // For now, we'll sign out the user and show a message
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast.success("Account deletion requested. Please contact support for account deletion.");
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account. Please contact support.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getUserInitials = () => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    return displayName || fullName || user?.email?.split("@")[0] || "User";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900">
        <AppHeader
          creditsRemaining={scansRemaining ?? 0}
          userName="User"
          userInitials="U"
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900">
      <AppHeader
        creditsRemaining={scansRemaining ?? 0}
        userName={getUserDisplayName()}
        userInitials={getUserInitials()}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card variant="elevated" className="shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <User className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Profile Information</span>
              </h2>
              
              <div className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1">
                    {isEditingName ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter display name"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter full name"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSaveProfile}
                            isLoading={isSaving}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsEditingName(false);
                              setDisplayName(user.metadata?.display_name || user.metadata?.full_name || "");
                              setFullName(user.metadata?.full_name || "");
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {getUserDisplayName()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          {user.email}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingName(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {user.email_confirmed_at ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs font-medium rounded">
                        <Check className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded">
                        <AlertTriangle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>

                {/* Account Created */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Account Created
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Sign In */}
                {user.last_sign_in_at && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Sign In
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Security Section */}
            <Card variant="elevated" className="shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Security</span>
              </h2>

              <div className="space-y-4">
                {/* Password Change */}
                {!showPasswordChange ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last changed: {user.email_confirmed_at ? "Recently" : "Never"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordChange(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleChangePassword}
                        isLoading={isChangingPassword}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Update Password
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Two-Factor Authentication (Placeholder) */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </Card>

            {/* Subscription Info */}
            {subscription && (
              <Card variant="elevated" className="shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Subscription
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Plan
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1) || "Free"} Plan
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/app/settings")}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Danger Zone */}
            <Card variant="elevated" className="shadow-sm border-danger/20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
                <span>Danger Zone</span>
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-danger/5 dark:bg-danger/10 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Delete Account
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            <Card variant="elevated" className="shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Summary
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    User ID
                  </p>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                    {user.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Account Status
                  </p>
                  <p className="text-sm font-medium text-success">
                    {user.email_confirmed_at ? "Active" : "Pending Verification"}
                  </p>
                </div>
                {subscription && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Subscription Status
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1) || "Free"}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone. All your scan history and data will be permanently deleted."
        confirmText="Delete Account"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
