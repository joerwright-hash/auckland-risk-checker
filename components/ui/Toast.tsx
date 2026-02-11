"use client";

import React, { useEffect } from "react";
import { CheckCircle, X, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error";
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 3000,
  type = "success",
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isError = type === "error";

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`bg-white dark:bg-gray-800 border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[250px] max-w-md ${
        isError 
          ? "border-danger/50 dark:border-danger/30" 
          : "border-gray-200 dark:border-gray-700"
      }`}>
        {isError ? (
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
        )}
        <span className="text-sm text-gray-900 dark:text-white flex-1">
          {message}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
