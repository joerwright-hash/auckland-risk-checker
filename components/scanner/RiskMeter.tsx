"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface RiskMeterProps {
  score: number;
  criticalCount: number;
  warningCount: number;
  minorCount: number;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  criticalCount,
  warningCount,
  minorCount,
}) => {
  const { t, language } = useLanguage();
  
  const getRiskLevel = () => {
    if (score >= 70) {
      return { 
        label: language === "de" ? "HOHES RISIKO" : "HIGH RISK", 
        color: "text-danger", 
        bg: "bg-danger" 
      };
    }
    if (score >= 40) {
      return { 
        label: language === "de" ? "MITTELES RISIKO" : "MEDIUM RISK", 
        color: "text-accent", 
        bg: "bg-accent" 
      };
    }
    return { 
      label: language === "de" ? "GERINGES RISIKO" : "LOW RISK", 
      color: "text-success", 
      bg: "bg-success" 
    };
  };

  const risk = getRiskLevel();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t.app.riskLevel}</h3>
        <span className={cn("text-xl font-bold", risk.color)}>{risk.label}</span>
      </div>

      <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-out rounded-full",
            risk.bg
          )}
          style={{ width: `${Math.min(100, score)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white drop-shadow-md">
            {score}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger" />
          <span className="text-gray-600 dark:text-gray-400">
            {t.app.critical}: <strong>{criticalCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-gray-600 dark:text-gray-400">
            {t.app.warnings}: <strong>{warningCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-gray-600 dark:text-gray-400">
            {t.app.minor}: <strong>{minorCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
