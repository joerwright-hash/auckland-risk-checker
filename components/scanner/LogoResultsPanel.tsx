"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { LogoAnalysisResults, LogoFinding } from "@/lib/logo-analysis";
import { exportLogoPDF } from "@/lib/logo-pdf-export";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  HelpCircle,
  Download,
  Copy,
  Share2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface LogoResultsPanelProps {
  results?: LogoAnalysisResults | null;
}

export const LogoResultsPanel: React.FC<LogoResultsPanelProps> = ({
  results = null,
}) => {
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score count-up
  useEffect(() => {
    if (!results) {
      setAnimatedScore(0);
      return;
    }

    const duration = 1500;
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

  const getStatusConfig = (severity: LogoFinding['severity']) => {
    switch (severity) {
      case 'compliant':
        return {
          icon: ShieldCheck,
          label: 'Compliant',
          color: 'text-success',
          bg: 'bg-green-50 dark:bg-green-900/10',
          border: 'border-success/40',
          pillBg: 'bg-success',
        };
      case 'critical':
        return {
          icon: ShieldX,
          label: 'Banned',
          color: 'text-danger',
          bg: 'bg-red-50 dark:bg-red-900/10',
          border: 'border-danger/40',
          pillBg: 'bg-danger',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Warning',
          color: 'text-accent',
          bg: 'bg-amber-50 dark:bg-amber-900/10',
          border: 'border-accent/40',
          pillBg: 'bg-accent',
        };
      case 'conditional':
        return {
          icon: ShieldAlert,
          label: 'Conditional',
          color: 'text-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/10',
          border: 'border-blue-400/40',
          pillBg: 'bg-blue-500',
        };
      case 'unknown':
        return {
          icon: HelpCircle,
          label: 'Unknown',
          color: 'text-gray-500',
          bg: 'bg-gray-50 dark:bg-gray-900/10',
          border: 'border-gray-400/40',
          pillBg: 'bg-gray-500',
        };
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 61) return { text: "text-danger", bg: "bg-danger", border: "border-danger" };
    if (score >= 31) return { text: "text-accent", bg: "bg-accent", border: "border-accent" };
    if (score >= 11) return { text: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500" };
    return { text: "text-success", bg: "bg-success", border: "border-success" };
  };

  const getRiskLevel = (score: number) => {
    if (score >= 61) return "Non-Compliant";
    if (score >= 31) return "Requires Review";
    if (score >= 11) return "Conditional";
    return "Compliant";
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
        return;
      }
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleCopySummary = () => {
    if (!results) return;
    const summary = `Logo Compliance Check\n` +
      `File: ${results.fileName}\n` +
      `Status: ${getRiskLevel(results.riskScore)}\n` +
      `Risk Score: ${results.riskScore}/100\n` +
      `Findings: ${results.summary.totalFindings}\n` +
      `Compliant: ${results.summary.compliantCount}\n` +
      `Critical: ${results.summary.criticalCount}\n` +
      `Warnings: ${results.summary.warningCount}\n` +
      `Conditional: ${results.summary.conditionalCount}`;
    copyToClipboard(summary);
  };

  // Empty State
  if (!results) {
    return (
      <Card variant="elevated" className="shadow-sm h-full min-h-[500px]">
        <EmptyState
          icon={Shield}
          title="Ready to Check"
          description="Upload a sustainability logo or select a known label to check its compliance with EU Directive 2024/825."
        />
      </Card>
    );
  }

  const riskColor = getRiskColor(results.riskScore);
  const riskLevel = getRiskLevel(results.riskScore);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Overall Status Card */}
      <Card variant="elevated" className="shadow-sm animate-fade-in">
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="50%"
                cy="50%"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
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
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${riskColor.text}`}>
                  {animatedScore}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">/100</div>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Label Status
              </h3>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full text-white ${riskColor.bg}`}>
                {riskLevel}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">File:</span>
                <span className="font-semibold text-gray-900 dark:text-white truncate">
                  {results.fileName}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">Findings:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {results.summary.totalFindings}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {results.summary.compliantCount > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                    {results.summary.compliantCount} Compliant
                  </span>
                )}
                {results.summary.criticalCount > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-danger/10 text-danger">
                    {results.summary.criticalCount} Banned
                  </span>
                )}
                {results.summary.warningCount > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {results.summary.warningCount} Warning
                  </span>
                )}
                {results.summary.conditionalCount > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                    {results.summary.conditionalCount} Conditional
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Findings */}
      <div className="space-y-3">
        {results.findings.map((finding, idx) => {
          const findingId = `logo-${idx}-${finding.id}`;
          const isExpanded = expandedFindings.has(findingId);
          const config = getStatusConfig(finding.severity);
          const Icon = config.icon;

          return (
            <Card
              key={findingId}
              variant="outlined"
              className={`${config.border} ${config.bg} transition-all animate-fade-in`}
              style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
            >
              <button
                onClick={() => toggleFinding(findingId)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${config.pillBg}`}>
                        {config.label}
                      </span>
                      {finding.matchedLabel && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {finding.matchedLabel.name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {finding.matchSource === 'filename' && 'Matched from filename'}
                      {finding.matchSource === 'text_content' && 'Matched from label text'}
                      {finding.matchSource === 'manual_selection' && 'Manual identification'}
                      {finding.matchSource === 'visual_pattern' && 'Visual pattern match'}
                      {' '}&bull; Confidence: {finding.matchConfidence}
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
                        Description
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {finding.description}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Regulation
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {finding.regulation}
                      </p>
                    </div>

                    {finding.matchedLabel && (
                      <>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Certifying Body
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {finding.matchedLabel.certifyingBody}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className={`flex items-center gap-1 ${finding.matchedLabel.isThirdPartyVerified ? 'text-success' : 'text-danger'}`}>
                            {finding.matchedLabel.isThirdPartyVerified ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            Third-party verified: {finding.matchedLabel.isThirdPartyVerified ? 'Yes' : 'No'}
                          </span>
                          <span className={`flex items-center gap-1 ${finding.matchedLabel.isPublicAuthority ? 'text-success' : 'text-gray-500'}`}>
                            {finding.matchedLabel.isPublicAuthority ? <CheckCircle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                            Public authority: {finding.matchedLabel.isPublicAuthority ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {finding.matchedLabel.website && (
                          <div>
                            <a
                              href={finding.matchedLabel.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {finding.matchedLabel.website}
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Recommendation
                      </div>
                      <p className={`text-sm font-medium ${
                        finding.severity === 'compliant' ? 'text-success' :
                        finding.severity === 'critical' ? 'text-danger' :
                        finding.severity === 'warning' ? 'text-accent' :
                        'text-gray-700 dark:text-gray-300'
                      }`}>
                        {finding.recommendation}
                      </p>
                    </div>

                    {finding.alternatives.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          Alternatives / Actions
                        </div>
                        <div className="space-y-2">
                          {finding.alternatives.map((alt, altIdx) => (
                            <div
                              key={altIdx}
                              className="flex items-center gap-2 p-2 rounded hover:bg-primary/5 group"
                            >
                              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                &bull; {alt}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(alt);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-primary/10 rounded text-primary hover:text-primary-dark"
                                title="Copy"
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

      {/* Regulatory Context */}
      <Card variant="outlined" className="border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {results.regulatoryContext}
          </p>
        </div>
      </Card>

      {/* Action Bar */}
      <Card variant="elevated" className="shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (results) exportLogoPDF(results);
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
            onClick={() => { console.log("Share"); }}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </Card>
    </div>
  );
};
