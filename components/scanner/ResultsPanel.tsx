"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonResults } from "@/components/ui/Skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { ScanResults, ScanMatch } from "@/lib/scanner-logic";
import { exportToPDF } from "@/lib/pdf-export";
import { 
  Search, 
  Download, 
  Share2, 
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Copy,
  FileText,
  Crown
} from "lucide-react";

interface ResultsPanelProps {
  results?: ScanResults | null;
  onExportPDF?: () => void;
  onCopySuggestion?: (text: string, index: number) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results = null,
  onExportPDF,
  onCopySuggestion,
}) => {
  const { t } = useLanguage();
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score count-up
  useEffect(() => {
    if (!results) {
      setAnimatedScore(0);
      return;
    }

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = results.riskScore / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newScore = Math.min(
        results.riskScore,
        Math.round(increment * currentStep)
      );
      setAnimatedScore(newScore);

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedScore(results.riskScore);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [results?.riskScore]);

  const toggleFinding = (findingId: string) => {
    const newExpanded = new Set(expandedFindings);
    if (newExpanded.has(findingId)) {
      newExpanded.delete(findingId);
    } else {
      newExpanded.add(findingId);
    }
    setExpandedFindings(newExpanded);
  };

  const getRiskColor = (score: number) => {
    if (score >= 81) return { text: "text-danger", bg: "bg-danger", border: "border-danger" };
    if (score >= 61) return { text: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500" };
    if (score >= 31) return { text: "text-accent", bg: "bg-accent", border: "border-accent" };
    return { text: "text-success", bg: "bg-success", border: "border-success" };
  };

  const getRiskLevel = (score: number) => {
    if (score >= 81) return "Critical Risk";
    if (score >= 61) return "High Risk";
    if (score >= 31) return "Medium Risk";
    return "Low Risk";
  };

  const getSeverityConfig = (severity: "critical" | "warning" | "minor") => {
    switch (severity) {
      case "critical":
        return {
          icon: AlertCircle,
          label: "Critical",
          color: "text-danger",
          bg: "bg-red-50 dark:bg-red-900/10",
          border: "border-danger/40",
          pillBg: "bg-danger",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          label: "Warning",
          color: "text-accent",
          bg: "bg-amber-50 dark:bg-amber-900/10",
          border: "border-accent/40",
          pillBg: "bg-accent",
        };
      case "minor":
        return {
          icon: Info,
          label: "Minor",
          color: "text-success",
          bg: "bg-green-50 dark:bg-green-900/10",
          border: "border-success/40",
          pillBg: "bg-success",
        };
    }
  };

  const handleCopySummary = () => {
    if (!results) return;
    
    const summary = `Risk Score: ${results.riskScore}%\n` +
      `Total Findings: ${results.summary.totalFindings}\n` +
      `Critical: ${results.findings.critical.length}\n` +
      `Warnings: ${results.findings.warnings.length}\n` +
      `Minor: ${results.findings.minor.length}\n` +
      `Estimated Penalty: ${results.summary.estimatedPenalty}`;
    
    copyToClipboard(summary);
  };

  // Copy to clipboard with fallback for older browsers
  const copyToClipboard = async (text: string) => {
    try {
      // Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
        return;
      }

      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          toast.success("Copied to clipboard");
        } else {
          throw new Error("Copy command failed");
        }
      } catch (err) {
        console.error("Fallback copy failed:", err);
        toast.error("Failed to copy");
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy");
    }
  };

  const handleCopyAlternative = (text: string) => {
    copyToClipboard(text);
    // Also call the callback if provided
    if (onCopySuggestion) {
      onCopySuggestion(text, 0);
    }
  };

  // Empty State
  if (!results) {
    return (
      <Card variant="elevated" className="shadow-sm h-full min-h-[500px]">
        <EmptyState
          icon={Search}
          title="Ready to Scan"
          description="Paste your text and click Scan to begin analyzing your marketing content for compliance."
        />
      </Card>
    );
  }

  const riskColor = getRiskColor(results.riskScore);
  const riskLevel = getRiskLevel(results.riskScore);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Risk Meter Card */}
      <Card variant="elevated" className="shadow-sm animate-fade-in">
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="transform -rotate-90 w-32 h-32">
              {/* Background circle */}
              <circle
                cx="50%"
                cy="50%"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50%"
                cy="50%"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`${riskColor.text} transition-all duration-1000 ease-out`}
              />
            </svg>
            {/* Score text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${riskColor.text}`}>
                  {animatedScore}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">/100</div>
              </div>
            </div>
          </div>

          {/* Risk Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Risk Level
              </h3>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${riskColor.bg} ${riskColor.text}`}>
                {riskLevel}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">Total Findings:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {results.summary.totalFindings}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">Unique Terms:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {results.summary.uniqueTerms}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">Est. Penalty:</span>
                <span className="font-semibold text-danger">
                  {results.summary.estimatedPenalty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Findings Cards - Grouped by Severity */}
      <div className="space-y-4">
        {/* Critical Findings */}
        {results.findings.critical.length > 0 && (
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h4 className="text-lg font-semibold text-danger flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Critical Findings ({results.findings.critical.length})
            </h4>
            {results.findings.critical.map((finding, idx) => {
              const findingId = `critical-${idx}-${finding.position}`;
              const isExpanded = expandedFindings.has(findingId);
              const config = getSeverityConfig("critical");
              const Icon = config.icon;

              return (
                <Card
                  key={findingId}
                  variant="outlined"
                  className={`${config.border} ${config.bg} transition-all animate-fade-in`}
                  style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                >
                  <button
                    onClick={() => toggleFinding(findingId)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${config.pillBg}`}>
                            {finding.term.term}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Line {finding.lineNumber} • {finding.term.regulation}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
                      <div className="space-y-4 pt-4">
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Context
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {finding.context}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Description
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {finding.term.description}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Penalty Range
                          </div>
                          <p className="text-sm font-semibold text-danger">
                            {finding.term.penaltyRange}
                          </p>
                        </div>
                        {finding.term.alternatives && finding.term.alternatives.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                              Alternative Suggestions
                            </div>
                            <div className="space-y-2">
                              {finding.term.alternatives.map((alt, altIdx) => (
                                <div
                                  key={altIdx}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 group"
                                >
                                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                    • {alt}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyAlternative(alt);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-primary/10 rounded text-primary hover:text-primary-dark"
                                    title="Copy alternative"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Warning Findings */}
        {results.findings.warnings.length > 0 && (
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h4 className="text-lg font-semibold text-accent flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Warnings ({results.findings.warnings.length})
            </h4>
            {results.findings.warnings.map((finding, idx) => {
              const findingId = `warning-${idx}-${finding.position}`;
              const isExpanded = expandedFindings.has(findingId);
              const config = getSeverityConfig("warning");
              const Icon = config.icon;

              return (
                <Card
                  key={findingId}
                  variant="outlined"
                  className={`${config.border} ${config.bg} transition-all animate-fade-in`}
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <button
                    onClick={() => toggleFinding(findingId)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${config.pillBg}`}>
                            {finding.term.term}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Line {finding.lineNumber} • {finding.term.regulation}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
                      <div className="space-y-4 pt-4">
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Context
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {finding.context}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Description
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {finding.term.description}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Penalty Range
                          </div>
                          <p className="text-sm font-semibold text-accent">
                            {finding.term.penaltyRange}
                          </p>
                        </div>
                        {finding.term.alternatives && finding.term.alternatives.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                              Alternative Suggestions
                            </div>
                            <div className="space-y-2">
                              {finding.term.alternatives.map((alt, altIdx) => (
                                <div
                                  key={altIdx}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 group"
                                >
                                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                    • {alt}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyAlternative(alt);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-primary/10 rounded text-primary hover:text-primary-dark"
                                    title="Copy alternative"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Minor Findings */}
        {results.findings.minor.length > 0 && (
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h4 className="text-lg font-semibold text-success flex items-center gap-2">
              <Info className="w-5 h-5" />
              Minor Issues ({results.findings.minor.length})
            </h4>
            {results.findings.minor.map((finding, idx) => {
              const findingId = `minor-${idx}-${finding.position}`;
              const isExpanded = expandedFindings.has(findingId);
              const config = getSeverityConfig("minor");
              const Icon = config.icon;

              return (
                <Card
                  key={findingId}
                  variant="outlined"
                  className={`${config.border} ${config.bg} transition-all animate-fade-in`}
                  style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                >
                  <button
                    onClick={() => toggleFinding(findingId)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${config.pillBg}`}>
                            {finding.term.term}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Line {finding.lineNumber} • {finding.term.regulation}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
                      <div className="space-y-4 pt-4">
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Context
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {finding.context}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Description
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {finding.term.description}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Penalty Range
                          </div>
                          <p className="text-sm font-semibold text-success">
                            {finding.term.penaltyRange}
                          </p>
                        </div>
                        {finding.term.alternatives && finding.term.alternatives.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                              Alternative Suggestions
                            </div>
                            <div className="space-y-2">
                              {finding.term.alternatives.map((alt, altIdx) => (
                                <div
                                  key={altIdx}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 group"
                                >
                                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                    • {alt}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyAlternative(alt);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-primary/10 rounded text-primary hover:text-primary-dark"
                                    title="Copy alternative"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* No Findings */}
        {results.summary.totalFindings === 0 && (
          <Card variant="elevated" className="shadow-sm">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
              <p className="font-medium">No issues found!</p>
              <p className="text-sm mt-1">Your content appears to be compliant.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Action Bar */}
      <Card variant="elevated" className="shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (results) {
                exportToPDF(results);
              }
              if (onExportPDF) {
                onExportPDF();
              }
            }}
            variant="primary"
            className="flex-1 min-w-[140px]"
            disabled={!results}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={handleCopySummary}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Summary
          </Button>
          <Button
            onClick={() => {
              console.log("Share");
            }}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={() => {
              console.log("Schedule Legal Review");
            }}
            variant="outline"
            className="flex-1 min-w-[140px] relative"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Legal Review
            <Crown className="w-3 h-3 absolute -top-1 -right-1 text-accent" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
