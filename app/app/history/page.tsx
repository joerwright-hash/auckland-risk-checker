"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ResultsPanel } from "@/components/scanner/ResultsPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { createSupabaseClient } from "@/lib/supabase/client";
import { getUserScans, deleteScan, type ScanRecord } from "@/lib/supabase/scans";
import { getUserSubscription } from "@/lib/supabase/subscriptions";
import { ScanResults, ScanMatch } from "@/lib/scanner-logic";
import { exportToPDF } from "@/lib/pdf-export";
import { getCurrentUserInfo } from "@/lib/user-utils";
import { toast } from "sonner";
import { 
  History, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Search,
  Loader2,
  Download,
  X,
  Trash2
} from "lucide-react";

/**
 * Converts a ScanRecord from the database to ScanResults format
 */
function convertScanRecordToResults(scan: ScanRecord): ScanResults {
  // Extract summary - check if it's in _metadata (fallback for old records)
  let summary = scan.summary;
  if (!summary && (scan.findings as any)._metadata?.summary) {
    summary = (scan.findings as any)._metadata.summary;
  }
  
  // Clean findings - remove _metadata if present
  const cleanFindings = { ...scan.findings };
  if ((cleanFindings as any)._metadata) {
    delete (cleanFindings as any)._metadata;
  }
  
  return {
    inputText: scan.input_text,
    timestamp: new Date(scan.created_at),
    riskScore: scan.risk_score,
    findings: {
      critical: (cleanFindings.critical || []).map((f: any) => ({
        term: f.term,
        matchText: f.matchText || '',
        position: f.position || 0,
        lineNumber: f.lineNumber || 0,
        context: f.context || '',
      })) as ScanMatch[],
      warnings: (cleanFindings.warnings || []).map((f: any) => ({
        term: f.term,
        matchText: f.matchText || '',
        position: f.position || 0,
        lineNumber: f.lineNumber || 0,
        context: f.context || '',
      })) as ScanMatch[],
      minor: (cleanFindings.minor || []).map((f: any) => ({
        term: f.term,
        matchText: f.matchText || '',
        position: f.position || 0,
        lineNumber: f.lineNumber || 0,
        context: f.context || '',
      })) as ScanMatch[],
    },
    summary: summary || {
      totalFindings: (cleanFindings.critical?.length || 0) + 
                     (cleanFindings.warnings?.length || 0) + 
                     (cleanFindings.minor?.length || 0),
      uniqueTerms: new Set([
        ...(cleanFindings.critical || []).map((f: any) => f.term?.term),
        ...(cleanFindings.warnings || []).map((f: any) => f.term?.term),
        ...(cleanFindings.minor || []).map((f: any) => f.term?.term),
      ].filter(Boolean)).size,
      estimatedPenalty: '',
    },
  };
}

export default function HistoryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [selectedResults, setSelectedResults] = useState<ScanResults | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Get current user and fetch scans
  useEffect(() => {
    const fetchScans = async () => {
      setIsLoading(true);
      try {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("Please sign in to view your scan history");
          router.push("/auth/login");
          return;
        }

        setUserId(user.id);
        
        // Get user display name and initials (will use cache if available)
        const userInfo = await getCurrentUserInfo();
        setUserName(userInfo.userName);
        setUserInitials(userInfo.userInitials);
        
        // Fetch subscription to get scans_remaining
        const { data: subData } = await getUserSubscription(user.id);
        if (subData) {
          setScansRemaining(subData.scans_remaining);
        }
        
        const { data, error } = await getUserScans(user.id);

        if (error) {
          console.error("Error fetching scans:", error);
          toast.error("Failed to load scan history");
        } else {
          setScans(data || []);
        }
      } catch (error) {
        console.error("Unexpected error fetching scans:", error);
        toast.error("Failed to load scan history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScans();
  }, [router]);

  const filteredScans = scans.filter((scan) =>
    scan.input_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.findings.critical.some((f: any) =>
      f.term?.term?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    scan.findings.warnings.some((f: any) =>
      f.term?.term?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    scan.findings.minor.some((f: any) =>
      f.term?.term?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getRiskColor = (score: number) => {
    if (score >= 81) return "text-danger";
    if (score >= 61) return "text-orange-500";
    if (score >= 31) return "text-accent";
    return "text-success";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 81) return "Critical Risk";
    if (score >= 61) return "High Risk";
    if (score >= 31) return "Medium Risk";
    return "Low Risk";
  };

  const handleScanClick = (scan: ScanRecord) => {
    const results = convertScanRecordToResults(scan);
    setSelectedScan(scan);
    setSelectedResults(results);
  };

  const handleCloseResults = () => {
    setSelectedScan(null);
    setSelectedResults(null);
  };

  const handleDeleteClick = (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    setScanToDelete(scanId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scanToDelete || !userId) {
      toast.error("Missing scan ID or user ID");
      setDeleteConfirmOpen(false);
      setScanToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteScan(scanToDelete, userId);
      
      if (result.error) {
        console.error("Error deleting scan:", result.error);
        toast.error(result.error.message || "Failed to delete scan");
        setIsDeleting(false);
        // Don't close dialog on error so user can try again
        return;
      }
      
      if (!result.deleted) {
        console.error("Delete operation did not succeed");
        toast.error("Failed to delete scan. Please try again.");
        setIsDeleting(false);
        return;
      }
      
      // Success - update UI
      toast.success("Scan deleted successfully");
      
      // Remove from local state
      setScans(prevScans => prevScans.filter(scan => scan.id !== scanToDelete));
      
      // If the deleted scan was selected, clear selection
      if (selectedScan?.id === scanToDelete) {
        setSelectedScan(null);
        setSelectedResults(null);
      }
      
      // Close dialog and reset state
      setDeleteConfirmOpen(false);
      setScanToDelete(null);
    } catch (error: any) {
      console.error("Unexpected error deleting scan:", error);
      toast.error(error?.message || "Failed to delete scan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setScanToDelete(null);
  };

  const handleExportPDF = (scan: ScanRecord) => {
    try {
      const results = convertScanRecordToResults(scan);
      exportToPDF(results);
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900 flex flex-col">
      <AppHeader
        activeTab="history"
        creditsRemaining={scansRemaining ?? 0}
        userName={userName || "User"}
        userInitials={userInitials || "U"}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - History List */}
        <div className={`w-full overflow-y-auto transition-all duration-300 ${
          selectedResults 
            ? 'lg:w-3/5 border-r border-gray-200 dark:border-gray-800' 
            : 'lg:w-full'
        }`}>
          <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Scan History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your previous scans
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredScans.length === 0 ? (
          <Card variant="elevated" className="shadow-sm">
            <EmptyState
              icon={FileText}
              title="No scans yet"
              description={
                searchQuery
                  ? "No scans match your search. Try a different query."
                  : "Start scanning your marketing content to see your history here."
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredScans.map((scan) => (
              <Card
                key={scan.id}
                variant="elevated"
                className={`shadow-sm hover:shadow-md transition-all ${
                  selectedScan?.id === scan.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'cursor-pointer'
                }`}
                onClick={() => handleScanClick(scan)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(scan.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {scan.input_text.slice(0, 100)}
                      {scan.input_text.length > 100 && "..."}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getRiskColor(scan.risk_score)}`}>
                          {scan.risk_score}% - {getRiskLabel(scan.risk_score)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-danger" />
                          {scan.findings.critical.length} critical
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-accent" />
                          {scan.findings.warnings.length} warnings
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-success" />
                          {scan.findings.minor.length} minor
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* PDF Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportPDF(scan);
                      }}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Download PDF Report"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteClick(scan.id, e)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      title="Delete scan"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
          </main>
        </div>

        {/* Right Panel - Results (40%) */}
        {selectedResults && selectedScan && (
          <div className="w-full lg:w-2/5 overflow-y-auto bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 py-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Scan Results
                </h2>
                <button
                  onClick={handleCloseResults}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Close results"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Full Scanned Text */}
              <Card variant="elevated" className="shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Scanned Text
                    </h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedScan.input_text);
                        toast.success("Text copied to clipboard");
                      }}
                      className="text-sm text-primary hover:text-primary-dark transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedScan.input_text}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {selectedScan.input_text.length} characters
                  </div>
                </div>
              </Card>

              {/* Results Panel */}
              <ResultsPanel
                results={selectedResults}
                onExportPDF={() => {
                  if (selectedScan) {
                    handleExportPDF(selectedScan);
                  }
                }}
                onCopySuggestion={(text, index) => {
                  navigator.clipboard.writeText(text);
                  toast.success("Suggestion copied to clipboard");
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Scan"
        message="Are you sure you want to delete this scan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
