"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";
import { Button } from "./Button";

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "de" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
    </Button>
  );
};
