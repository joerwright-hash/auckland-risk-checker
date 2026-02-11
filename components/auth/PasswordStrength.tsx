"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: "", color: "" };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Medium", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };

  const strength = getStrength(password);
  const percentage = (strength.score / 6) * 100;

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">Password strength</span>
        <span className={cn(
          "text-xs font-medium",
          strength.score <= 2 ? "text-red-500" :
          strength.score <= 4 ? "text-amber-500" :
          "text-green-500"
        )}>
          {strength.label}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            strength.color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
