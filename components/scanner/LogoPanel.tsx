"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { analyseLogo, LogoAnalysisResults, getCertifiedLabelOptions } from "@/lib/logo-analysis";
import { allLabels } from "@/lib/data/sustainability-labels";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

interface LogoPanelProps {
  onAnalysisComplete?: (results: LogoAnalysisResults) => void;
  logoResults?: LogoAnalysisResults | null;
}

export const LogoPanel: React.FC<LogoPanelProps> = ({
  onAnalysisComplete,
  logoResults,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualLabelName, setManualLabelName] = useState("");
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const certifiedOptions = getCertifiedLabelOptions();

  const handleFileUpload = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image file (PNG, JPG, GIF, SVG, or WebP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setUploadedFile(file);
    setAnalysisDone(false);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    toast.success(`Logo "${file.name}" uploaded successfully`);
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(null);
    setPreviewUrl(null);
    setAnalysisDone(false);
    setManualLabelName("");
    setExtractedText("");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyse = async () => {
    if (!uploadedFile && !manualLabelName.trim()) {
      toast.error('Please upload a logo image or enter a label name');
      return;
    }

    setIsAnalysing(true);
    setAnalysisDone(false);

    try {
      // Short delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const results = analyseLogo(
        uploadedFile?.name || 'manual-entry',
        uploadedFile?.size || 0,
        extractedText || undefined,
        manualLabelName || undefined,
      );

      if (onAnalysisComplete) {
        onAnalysisComplete(results);
      }

      setAnalysisDone(true);
      toast.success("Logo analysis completed!");
      setTimeout(() => setAnalysisDone(false), 2000);
    } catch (error) {
      console.error("Error during logo analysis:", error);
      toast.error("Failed to analyse logo. Please try again.");
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleLabelSelect = (labelName: string) => {
    setManualLabelName(labelName);
    setShowLabelSelector(false);
  };

  return (
    <Card variant="elevated" className="shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Logo & Label Compliance Check
          </h2>
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            EU 2024/825
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload a sustainability logo or label to check its compliance under the EU Empowering Consumers Directive.
          From September 2026, only labels based on certified third-party schemes or public authorities are permitted.
        </p>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-20 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Upload className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-primary">Drop logo here</p>
              </div>
            </div>
          )}

          {!uploadedFile ? (
            <div className="flex flex-col items-center justify-center p-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                Drag & drop a logo image here, or click to browse
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors text-sm font-medium text-primary">
                <Upload className="w-4 h-4" />
                <span>Upload Logo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF, SVG, WebP (max 10MB)</p>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                {previewUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {uploadedFile.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Manual Label Identification */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Or identify the label manually
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualLabelName}
                onChange={(e) => setManualLabelName(e.target.value)}
                placeholder='e.g., "FSC", "EU Ecolabel", "Carbon Neutral"'
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white text-sm"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLabelSelector(!showLabelSelector)}
                className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                title="Browse known labels"
              >
                <Search className="w-4 h-4" />
                <ChevronDown className={`w-3 h-3 transition-transform ${showLabelSelector ? 'rotate-180' : ''}`} />
              </button>

              {showLabelSelector && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLabelSelector(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-80 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Certified Labels (Compliant)</p>
                    </div>
                    {certifiedOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleLabelSelect(option.name)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-sm"
                      >
                        <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{option.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{option.category}</span>
                      </button>
                    ))}
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Banned Label Types</p>
                    </div>
                    {allLabels.filter(l => l.status === 'banned').map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelSelect(label.name)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-sm"
                      >
                        <ShieldX className="w-4 h-4 text-danger flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{label.name}</span>
                      </button>
                    ))}
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Conditional Labels</p>
                    </div>
                    {allLabels.filter(l => l.status === 'conditional').map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelSelect(label.name)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-sm"
                      >
                        <ShieldAlert className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{label.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Optional: Text found on label */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Text visible on the label <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder='Enter any text visible on the label, e.g., "Carbon Neutral Certified", "100% Sustainable"'
            className="w-full min-h-[80px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white resize-y text-sm"
          />
        </div>

        {/* Analyse Button */}
        <div className="flex items-center gap-3">
          {uploadedFile && (
            <button
              onClick={handleRemoveFile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}

          <Button
            onClick={handleAnalyse}
            disabled={isAnalysing || (!uploadedFile && !manualLabelName.trim())}
            className={`ml-auto px-8 py-2.5 text-base font-semibold transition-all ${
              isAnalysing ? "animate-pulse" : ""
            } ${analysisDone ? "animate-success-flash bg-success" : ""}`}
            variant="primary"
          >
            {isAnalysing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analysing...
              </>
            ) : analysisDone ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Analysis Complete
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Check Compliance
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">How it works</p>
              <ul className="space-y-0.5 text-blue-600 dark:text-blue-400">
                <li>Upload a logo/label image or enter the label name</li>
                <li>Optionally enter any text visible on the label</li>
                <li>The system checks against 30+ known certification schemes</li>
                <li>Get instant compliance status under EU Directive 2024/825</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
