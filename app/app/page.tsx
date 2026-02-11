"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/AppHeader";
import { InputPanel } from "@/components/scanner/InputPanel";
import { ResultsPanel } from "@/components/scanner/ResultsPanel";
import { LogoPanel } from "@/components/scanner/LogoPanel";
import { LogoResultsPanel } from "@/components/scanner/LogoResultsPanel";
import { ScanResults, scanTextNew } from "@/lib/scanner-logic";
import { LogoAnalysisResults } from "@/lib/logo-analysis";
import { createSupabaseClient } from "@/lib/supabase/client";
import { saveScan, getUserScans, type ScanRecord } from "@/lib/supabase/scans";
import { getUserSubscription, type UserSubscription } from "@/lib/supabase/subscriptions";
import { getScanLimit, isUnlimited } from "@/lib/subscription-limits";
import { getCurrentUserInfo } from "@/lib/user-utils";
import { toast } from "sonner";
import { FileText, Shield } from "lucide-react";

type CheckerMode = "text" | "logo";

export default function AppPage() {
  const [checkerMode, setCheckerMode] = useState<CheckerMode>("text");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<ScanResults | null>(null);
  const [logoResults, setLogoResults] = useState<LogoAnalysisResults | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [scansUsed, setScansUsed] = useState(0);
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

  const handleScanComplete = useCallback(async (scanResults: ScanResults) => {
    setResults(scanResults);

    // Save scan to database if user is logged in
    if (userId) {
      try {
        const { error } = await saveScan(userId, scanResults);
        if (error) {
          console.error("Error saving scan:", error);
          const errorMessage = error.message || "Failed to save scan to history";
          toast.error(errorMessage);
        } else {
          toast.success("Scan saved to history");

          // Refresh usage data
          const { data: subData } = await getUserSubscription(userId);
          setSubscription(subData);

          const plan = (subData?.plan || 'free') as 'free' | 'starter' | 'pro';
          if (isUnlimited(plan)) {
            setScansRemaining(null);
          } else {
            setScansRemaining(subData?.scans_remaining ?? 0);
          }
          setScansUsed(prev => prev + 1);
        }
      } catch (error: any) {
        console.error("Unexpected error saving scan:", error);
        const errorMessage = error?.message || "Failed to save scan to history";
        toast.error(errorMessage);
      }
    }
  }, [userId]);

  const handleLogoAnalysisComplete = useCallback((analysisResults: LogoAnalysisResults) => {
    setLogoResults(analysisResults);
  }, []);

  // Get current user, subscription, and usage data
  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        const userInfo = await getCurrentUserInfo();
        setUserName(userInfo.userName);
        setUserInitials(userInfo.userInitials);

        const { data: subData } = await getUserSubscription(user.id);
        setSubscription(subData);

        const plan = (subData?.plan || 'free') as 'free' | 'starter' | 'pro';

        const { data: scans } = await getUserScans(user.id);
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyScans = (scans || []).filter(
          (scan: ScanRecord) => new Date(scan.created_at) >= thisMonthStart
        );

        setScansUsed(monthlyScans.length);

        if (isUnlimited(plan)) {
          setScansRemaining(null);
        } else {
          setScansRemaining(subData?.scans_remaining ?? 0);
        }
      }
    };

    loadUserData();

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      toast.success('Subscription activated successfully!');
      window.history.replaceState({}, '', '/app');
      loadUserData();
    }

    const autoScan = urlParams.get('autoScan');
    const demoTextParam = urlParams.get('demoText');

    if (autoScan === 'true' && demoTextParam) {
      const decodedDemoText = decodeURIComponent(demoTextParam);
      if (decodedDemoText.trim()) {
        setInputText(decodedDemoText);

        setTimeout(async () => {
          try {
            const scanResults = scanTextNew(decodedDemoText);
            setResults(scanResults);

            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              try {
                const { error } = await saveScan(user.id, scanResults);
                if (error) {
                  console.error("Error saving scan:", error);
                } else {
                  toast.success('Willkommen! Ihr Demo-Text wurde automatisch analysiert und gespeichert.');
                }
              } catch (error: any) {
                console.error("Error saving scan:", error);
              }
            } else {
              toast.success('Willkommen! Ihr Demo-Text wurde automatisch analysiert.');
            }
          } catch (error) {
            console.error('Error auto-scanning demo text:', error);
            toast.error('Fehler beim automatischen Scan. Bitte versuchen Sie es erneut.');
          }
        }, 500);

        window.history.replaceState({}, '', '/app');
        sessionStorage.removeItem('demoTextForScan');
      }
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900 flex flex-col"
    >
      <AppHeader
        activeTab="scanner"
        creditsRemaining={scansRemaining}
        scansUsed={scansUsed}
        plan={subscription?.plan || "free"}
        userName={userName || "User"}
        userInitials={userInitials || "U"}
      />

      {/* Mode Selector */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCheckerMode("text")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                checkerMode === "text"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Marketing Copy Scanner</span>
            </button>
            <button
              onClick={() => setCheckerMode("logo")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                checkerMode === "logo"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Logo & Label Checker</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Input (60%) */}
        <div className="w-full lg:w-3/5 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {checkerMode === "text" ? (
              <InputPanel
                inputText={inputText}
                onInputChange={setInputText}
                onScanComplete={handleScanComplete}
                scanResults={results}
              />
            ) : (
              <LogoPanel
                onAnalysisComplete={handleLogoAnalysisComplete}
                logoResults={logoResults}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Results (40%) */}
        <div className="w-full lg:w-2/5 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            {checkerMode === "text" ? (
              <ResultsPanel
                results={results}
                onExportPDF={() => {
                  console.log("Export PDF", results);
                }}
                onCopySuggestion={(text, index) => {
                  navigator.clipboard.writeText(text);
                  console.log("Copied suggestion:", text);
                }}
              />
            ) : (
              <LogoResultsPanel results={logoResults} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
