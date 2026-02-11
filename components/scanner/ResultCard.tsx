import React, { useState } from "react";
import { ScanResult } from "@/lib/scanner-logic";
import { Copy, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  finding: ScanResult;
  onCopySuggestion: (text: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ finding, onCopySuggestion }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      color: "text-danger",
      bg: "bg-red-50/50 dark:bg-red-900/10",
      border: "border-danger/40",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-accent",
      bg: "bg-amber-50/50 dark:bg-amber-900/10",
      border: "border-accent/40",
    },
    minor: {
      icon: Info,
      color: "text-success",
      bg: "bg-green-50/50 dark:bg-green-900/10",
      border: "border-success/40",
    },
  };

  const config = severityConfig[finding.severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "border-2 rounded-lg p-4 transition-all duration-200",
        config.bg,
        config.border
      )}
    >
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3 flex-1">
          <Icon className={cn("w-5 h-5 mt-0.5", config.color)} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("font-semibold text-sm uppercase", config.color)}>
                {finding.severity}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                • {finding.matches.length} {finding.matches.length === 1 ? "match" : "matches"}
              </span>
            </div>
            <p className="font-mono text-sm font-semibold">"{finding.term}"</p>
            {finding.matches.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Found on line{finding.matches.length > 1 ? "s" : ""}:{" "}
                {finding.matches.map((m) => m.line).join(", ")}
              </p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 animate-slide-up">
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {finding.description}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Regulation: {finding.regulation}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Penalty: {finding.penaltyRange}
              </span>
            </div>
          </div>

          {finding.alternatives.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Alternative Suggestions:</h4>
              <div className="space-y-2">
                {finding.alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                      {alt}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopySuggestion(alt);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Copy suggestion"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
