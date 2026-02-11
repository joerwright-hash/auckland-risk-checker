"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RiskMeter } from "@/components/scanner/RiskMeter";
import { ResultCard } from "@/components/scanner/ResultCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScanResponse } from "@/lib/scanner-logic";
import { Download, Copy, FileText, CheckCircle } from "lucide-react";

interface ResultsPanelProps {
  scanResult: ScanResponse | null;
  onExportPDF: () => void;
  onCopySuggestion: (text: string, index: number) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  scanResult,
  onExportPDF,
  onCopySuggestion,
}) => {
  const { t } = useLanguage();

  if (!scanResult) {
    return (
      <Card variant="elevated" className="shadow-sm h-full flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
            {t.app.noResults}
          </p>
          <p className="text-sm">
            {t.app.noResultsDesc}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card variant="elevated" className="shadow-sm">
        <RiskMeter
          score={scanResult.score}
          criticalCount={scanResult.criticalCount}
          warningCount={scanResult.warningCount}
          minorCount={scanResult.minorCount}
        />
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={onExportPDF}
          variant="secondary"
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          {t.app.exportPDF}
        </Button>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(
              JSON.stringify(scanResult, null, 2)
            );
          }}
          variant="outline"
          title="Copy results as JSON"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      <Card variant="elevated" className="shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
          {t.app.flaggedTerms} ({scanResult.findings.length})
        </h3>
        {scanResult.findings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
            <p>{t.app.noIssues}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {scanResult.findings.map((finding, idx) => (
              <ResultCard
                key={idx}
                finding={finding}
                onCopySuggestion={(text) => onCopySuggestion(text, idx)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
