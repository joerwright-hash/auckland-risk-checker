"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { 
  Leaf, 
  Search, 
  History, 
  FileText, 
  Settings,
  User,
  CreditCard,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { formatUsageDisplay, getUsagePercentage, getEncouragingMessage, isUnlimited } from "@/lib/subscription-limits";

interface AppHeaderProps {
  activeTab?: "scanner" | "history" | "reports" | "settings" | "account" | "billing";
  creditsRemaining?: number | null;
  scansUsed?: number;
  plan?: "free" | "starter" | "pro";
  userName?: string;
  userInitials?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  creditsRemaining = null,
  scansUsed = 0,
  plan = "free",
  userName = "User",
  userInitials = "U",
}) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  const navTabs = [
    { id: "scanner", label: "Scanner", icon: Search, href: "/app" },
    { id: "history", label: "History", icon: History, href: "/app/history" },
    { id: "reports", label: "Reports", icon: FileText, href: "/app/reports" },
    { id: "settings", label: "Settings", icon: Settings, href: "/app/settings" },
  ];

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Close dropdown/menu immediately
      setShowUserDropdown(false);
      setShowMobileMenu(false);
      
      const supabase = createSupabaseClient();
      
      // Sign out with scope: 'local' to clear local session
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Error signing out:', error);
        // Try to redirect anyway and clear local storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        router.push('/');
        toast.error('Signed out locally. Please clear cookies if issues persist.');
        return;
      }
      
      // Clear local storage as well
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Redirect to landing page
      router.push('/');
      router.refresh(); // Force refresh to clear any cached data
      
      toast.success('Successfully signed out');
    } catch (error: any) {
      console.error('Unexpected error during logout:', error);
      
      // Clear storage and redirect anyway
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      router.push('/');
      router.refresh();
      toast.error('Signed out locally');
    }
  };

  const userMenuItems = [
    { id: "account", label: "Account", icon: User, href: "/app/account" },
    { id: "billing", label: "Billing", icon: CreditCard, href: "/app/billing" },
    { id: "logout", label: "Logout", icon: LogOut, href: "#", action: handleLogout },
  ];

  // Generate avatar color based on initials
  const getAvatarColor = (initials: string) => {
    const colors = [
      "bg-primary",
      "bg-accent",
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(userInitials);

  // Usage Display Component
  const UsageDisplay: React.FC<{
    plan: "free" | "starter" | "pro";
    scansUsed: number;
    scansRemaining: number | null;
    isMobile?: boolean;
  }> = ({ plan, scansUsed, scansRemaining, isMobile = false }) => {
    const usageText = formatUsageDisplay(plan, scansUsed, scansRemaining);
    const usagePercentage = getUsagePercentage(plan, scansUsed);
    const encouragingMessage = getEncouragingMessage(plan, scansRemaining);
    const isUnlimitedPlan = isUnlimited(plan);

    if (isMobile) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Usage
            </span>
            <span className="text-sm font-semibold text-primary">
              {usageText}
            </span>
          </div>
          {!isUnlimitedPlan && scansRemaining !== null && (
            <div className="px-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    usagePercentage >= 90
                      ? "bg-danger"
                      : usagePercentage >= 70
                      ? "bg-accent"
                      : "bg-success"
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              {encouragingMessage && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  {encouragingMessage}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    // Compact format for header bar
    const compactText = isUnlimitedPlan
      ? `${scansUsed} scans`
      : scansRemaining !== null
      ? `${scansRemaining} scans left`
      : `${scansUsed} scans`;

    return (
      <div className="relative group">
        {/* Compact display (always visible) */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {compactText}
          </span>
        </div>
        
        {/* Expanded tooltip on hover (shows full information) */}
        {!isUnlimitedPlan && scansRemaining !== null && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {usageText}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    usagePercentage >= 90
                      ? "bg-danger"
                      : usagePercentage >= 70
                      ? "bg-accent"
                      : "bg-success"
                  }`}
                />
              </div>
              {encouragingMessage && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {encouragingMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand (Left) */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Green Claim Check
            </span>
          </Link>

          {/* Navigation Tabs (Center) - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-primary font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section (Right) - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Usage Display */}
            <UsageDisplay
              plan={plan}
              scansUsed={scansUsed}
              scansRemaining={creditsRemaining}
            />

            {/* Language & Dark Mode */}
            <LanguageToggle />
            <DarkModeToggle />

            {/* User Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm`}>
                  {userInitials}
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isUnlimited(plan) 
                        ? `${scansUsed} scans this month`
                        : creditsRemaining !== null
                        ? `${creditsRemaining} scans remaining`
                        : `${scansUsed} scans`
                      }
                    </p>
                  </div>
                  <div className="py-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      // For logout, use button instead of Link
                      if (item.id === "logout") {
                        return (
                          <button
                            key={item.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowUserDropdown(false);
                              if (item.action) {
                                item.action(e);
                              }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </button>
                        );
                      }
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => {
                            setShowUserDropdown(false);
                            if (item.action) {
                              item.action();
                            }
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <DarkModeToggle />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4 animate-fade-in">
            {/* Usage in Mobile Menu */}
            <div className="px-4 mb-4">
              <UsageDisplay
                plan={plan}
                scansUsed={scansUsed}
                scansRemaining={creditsRemaining}
                isMobile
              />
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1 px-4">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Section in Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 px-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold`}>
                  {userInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isUnlimited(plan) 
                      ? `${scansUsed} scans this month`
                      : creditsRemaining !== null
                      ? `${creditsRemaining} scans remaining`
                      : `${scansUsed} scans`
                    }
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  // For logout, use button instead of Link
                  if (item.id === "logout") {
                    return (
                      <button
                        key={item.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMobileMenu(false);
                          if (item.action) {
                            item.action(e);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        setShowMobileMenu(false);
                        if (item.action) {
                          item.action();
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
