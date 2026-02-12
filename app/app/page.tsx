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
import { toast } from "sonner";
import { FileText, Shield } from "lucide-react";

type CheckerMode = "text" | "logo";

export default function AppPage() {
  const [checkerMode, setCheckerMode] = useState<CheckerMode>("text");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<ScanResults | null>(null);
  const [logoResults, setLogoResults] = useState<LogoAnalysisResults | null>(null);
  const [scansUsed, setScansUsed] = useState(0);

  const handleScanComplete = useCallback(async (scanResults: ScanResults) => {
    setResults(scanResults);
    setScansUsed(prev => prev + 1);
  }, []);

  const handleLogoAnalysisComplete = useCallback((analysisResults: LogoAnalysisResults) => {
    setLogoResults(analysisResults);
  }, []);

  // Handle auto-scan from URL params (demo text)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoScan = urlParams.get('autoScan');
    const demoTextParam = urlParams.get('demoText');

    if (autoScan === 'true' && demoTextParam) {
      const decodedDemoText = decodeURIComponent(demoTextParam);
      if (decodedDemoText.trim()) {
        setInputText(decodedDemoText);

        setTimeout(() => {
          try {
            const scanResults = scanTextNew(decodedDemoText);
            setResults(scanResults);
            setScansUsed(prev => prev + 1);
            toast.success('Demo text was automatically scanned.');
          } catch (error) {
            console.error('Error auto-scanning demo text:', error);
            toast.error('Error during automatic scan. Please try again.');
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
        creditsRemaining={null}
        scansUsed={scansUsed}
        plan="pro"
        userName="User"
        userInitials="U"
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
