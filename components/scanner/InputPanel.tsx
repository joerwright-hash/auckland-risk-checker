"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { scanTextNew, ScanResults } from "@/lib/scanner-logic";
import { 
  FileText, 
  Upload, 
  X, 
  ChevronDown,
  Mail,
  MessageSquare,
  Package,
  Globe,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  File,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";

interface InputPanelProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onScan?: () => void; // Legacy prop for backward compatibility
  isScanning?: boolean; // Legacy prop
  onScanComplete?: (results: ScanResults) => void;
  scanResults?: ScanResults | null; // Results for highlighting
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  onInputChange,
  onScan,
  isScanning: externalIsScanning,
  onScanComplete,
  scanResults,
}) => {
  const { t } = useLanguage();
  const [showTemplates, setShowTemplates] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("Free");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputType, setInputType] = useState<"text" | "document" | "url">("text");
  const [documentText, setDocumentText] = useState(""); // Text from document
  const [urlText, setUrlText] = useState(""); // Text from URL
  const [urlInput, setUrlInput] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const exampleTemplates = [
    {
      name: "Email Campaign",
      icon: Mail,
      text: "Dear customers,\n\nWe're excited to announce our new klimaneutral product line. Our products are 100% umweltfreundlich and made with sustainable materials. Join our green initiative today!",
    },
    {
      name: "Social Media Post",
      icon: MessageSquare,
      text: "🌱 Introducing our eco-friendly new collection! Made from sustainable materials and completely carbon neutral. #green #sustainable",
    },
    {
      name: "Product Description",
      icon: Package,
      text: "This product is klimaneutral and 100% umweltfreundlich. Made with nachhaltig materials and biologisch abbaubar packaging.",
    },
    {
      name: "Website Copy",
      icon: Globe,
      text: "Company X announces its commitment to becoming klimaneutral by 2025. Our products are now vollständig nachhaltig and umweltfreundlich.",
    },
  ];

  const handleTemplateSelect = (templateText: string) => {
    onInputChange(templateText);
    setShowTemplates(false);
  };

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['.txt', '.docx', '.pdf'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return { valid: false, error: 'Unsupported file format. Please upload .txt, .docx, or .pdf' };
    }

    return { valid: true };
  };

  // Parse text from file
  const parseFileContent = async (file: File): Promise<string> => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === '.txt') {
      return await file.text();
    }

    if (fileExtension === '.docx') {
      // Dynamic import for mammoth (client-side only)
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (fileExtension === '.pdf') {
      // Use pdfjs-dist (PDF.js) for browser-compatible PDF parsing
      try {
        // Dynamic import to ensure client-side only
        const pdfjsLib = await import('pdfjs-dist');
        
        // Configure worker for PDF.js - use local worker if available, otherwise CDN
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          // Try local worker first (copied to public folder)
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
          
          // Fallback to CDN if local worker fails (will be handled by PDF.js)
          // We can also set CDN explicitly as backup:
          const version = pdfjsLib.version || '4.10.38';
          const cdnFallback = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
          
          // Note: PDF.js will automatically try CDN if local worker fails to load
        }
        
        const arrayBuffer = await file.arrayBuffer();
        
        // Use getDocument with proper options for v4.10
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0, // Suppress warnings
        });
        
        const pdf = await loadingTask.promise;
        
        const numPages = pdf.numPages;
        const textPages: string[] = [];
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Extract text items and join them
          const pageText = textContent.items
            .map((item: any) => {
              // Handle both 'str' and 'text' properties
              return item.str || item.text || '';
            })
            .filter((text: string) => text.trim().length > 0)
            .join(' ');
          
          textPages.push(pageText);
        }
        
        // Clean up
        await loadingTask.destroy();
        
        // Join all pages with newlines
        const fullText = textPages.join('\n\n').trim();
        
        if (!fullText) {
          throw new Error('PDF appears to be image-based or contains no extractable text.');
        }
        
        return fullText;
      } catch (error: any) {
        console.error('PDF parsing error:', error);
        console.error('Error details:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to parse PDF. ';
        
        if (error?.message?.includes('image-based') || error?.message?.includes('extractable')) {
          errorMessage += 'PDF appears to be image-based or contains no extractable text. Please use a text-based PDF or convert to .txt or .docx format.';
        } else if (error?.message?.includes('Invalid PDF') || error?.message?.includes('Invalid') || error?.name === 'InvalidPDFException') {
          errorMessage += 'The file appears to be corrupted or is not a valid PDF. Please try a different file.';
        } else if (error?.message?.includes('worker') || error?.message?.includes('Worker')) {
          errorMessage += 'Worker initialization failed. Please try again or use a different file format.';
        } else if (error?.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Please ensure the file is not corrupted or try converting to .txt or .docx format.';
        }
        
        throw new Error(errorMessage);
      }
    }

    throw new Error('Unsupported file type');
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const text = await parseFileContent(file);
      setDocumentText(text);
      onInputChange(text);
      toast.success(`File "${file.name}" loaded successfully`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please try again.');
      setUploadedFile(null);
      setDocumentText('');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
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
    if (file) {
      handleFileUpload(file);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setDocumentText('');
    onInputChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onInputChange("");
    setScanSuccess(false);
    setShowHighlights(false);
    setUploadedFile(null);
    setDocumentText('');
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Normalize URL: add http:// if missing, handle www. optionally
  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    
    // Remove leading/trailing whitespace
    normalized = normalized.trim();
    
    // If it doesn't start with http:// or https://, add https://
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized;
    }
    
    return normalized;
  };

  // Fetch text from URL
  const fetchUrlContent = async (url: string): Promise<string> => {
    try {
      const normalizedUrl = normalizeUrl(url);
      
      // Validate URL
      const urlObj = new URL(normalizedUrl);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('URL must start with http:// or https://');
      }

      // Use a CORS proxy or fetch from API route to avoid CORS issues
      // For now, we'll use a server-side API route
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch URL' }));
        throw new Error(errorData.error || `Failed to fetch URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error: any) {
      console.error('Error fetching URL:', error);
      if (error.message.includes('Invalid URL')) {
        throw new Error('Invalid URL format. Please enter a valid URL starting with http:// or https://');
      }
      throw error;
    }
  };

  // Handle URL input
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsFetchingUrl(true);
    try {
      const normalizedUrl = normalizeUrl(urlInput.trim());
      const text = await fetchUrlContent(normalizedUrl);
      if (!text.trim()) {
        toast.warning('No text content found on the page');
        return;
      }
      setUrlText(text);
      onInputChange(text);
      setUrlInput(normalizedUrl); // Store normalized URL for display
      // Don't switch tabs - stay in URL tab
      toast.success('URL content loaded successfully');
    } catch (error: any) {
      console.error('Error fetching URL content:', error);
      toast.error(error.message || 'Failed to fetch URL content. Please check the URL and try again.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Render highlighted text with overlays
  const renderHighlightedText = (text: string, results: ScanResults): React.ReactNode => {
    if (!text || !results) return text;

    // Collect all matches with their positions and severities
    const highlights: Array<{
      start: number;
      end: number;
      severity: 'critical' | 'warning' | 'minor';
      term: string;
    }> = [];

    // Add critical matches
    results.findings.critical.forEach((finding) => {
      highlights.push({
        start: finding.position,
        end: finding.position + finding.matchText.length,
        severity: 'critical',
        term: finding.term.term,
      });
    });

    // Add warning matches
    results.findings.warnings.forEach((finding) => {
      highlights.push({
        start: finding.position,
        end: finding.position + finding.matchText.length,
        severity: 'warning',
        term: finding.term.term,
      });
    });

    // Add minor matches
    results.findings.minor.forEach((finding) => {
      highlights.push({
        start: finding.position,
        end: finding.position + finding.matchText.length,
        severity: 'minor',
        term: finding.term.term,
      });
    });

    // Sort by position (descending) to avoid offset issues
    highlights.sort((a, b) => b.start - a.start);

    // Build JSX with highlights
    let lastIndex = text.length;
    const elements: React.ReactNode[] = [];

    highlights.forEach((highlight) => {
      // Add text after highlight
      if (highlight.end < lastIndex) {
        const afterText = text.substring(highlight.end, lastIndex);
        // Escape HTML and preserve whitespace
        const escapedAfter = afterText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '\n');
        elements.unshift(
          <span key={`text-${highlight.end}`} dangerouslySetInnerHTML={{ __html: escapedAfter }} />
        );
      }

      // Add highlighted span
      const highlightClass = 
        highlight.severity === 'critical' ? 'bg-danger/30 dark:bg-danger/20' :
        highlight.severity === 'warning' ? 'bg-accent/30 dark:bg-accent/20' :
        'bg-success/30 dark:bg-success/20';

      const borderClass =
        highlight.severity === 'critical' ? 'border-danger/60' :
        highlight.severity === 'warning' ? 'border-accent/60' :
        'border-success/60';

      const matchText = text.substring(highlight.start, highlight.end);
      const escapedMatch = matchText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      elements.unshift(
        <span
          key={`highlight-${highlight.start}`}
          className={`${highlightClass} border-b-2 ${borderClass} cursor-help group relative inline`}
        >
          <span dangerouslySetInnerHTML={{ __html: escapedMatch }} />
          {/* Tooltip */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity shadow-lg">
            {highlight.term}
            <span className={`ml-2 ${
              highlight.severity === 'critical' ? 'text-red-300' :
              highlight.severity === 'warning' ? 'text-amber-300' :
              'text-green-300'
            }`}>
              ({highlight.severity})
            </span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></span>
          </span>
        </span>
      );

      lastIndex = highlight.start;
    });

    // Add remaining text at the beginning
    if (lastIndex > 0) {
      const beforeText = text.substring(0, lastIndex);
      const escapedBefore = beforeText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      elements.unshift(
        <span key="text-start" dangerouslySetInnerHTML={{ __html: escapedBefore }} />
      );
    }

    return <>{elements}</>;
  };

  const handleScan = async () => {
    // Get text from the active tab
    let textToScan = "";
    if (inputType === 'text') {
      textToScan = inputText;
    } else if (inputType === 'document') {
      textToScan = documentText;
    } else if (inputType === 'url') {
      textToScan = urlText;
    }

    if (!textToScan.trim() || isScanning) return;

    // Check scan limits before scanning
    try {
      const response = await fetch("/api/decrement-scans", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Limit reached or error
        if (response.status === 403 || data.error === "Scan limit reached") {
          setShowUpgradeModal(true);
          toast.error("Scan limit reached. Please upgrade to continue.");
          return;
        }
        throw new Error(data.error || "Failed to check scan limit");
      }

      // Update local state if needed
      // The parent component will refresh usage data
    } catch (error: any) {
      console.error("Error checking scan limit:", error);
      // Continue with scan if check fails (graceful degradation)
      // In production, you might want to block the scan
    }

    setIsScanning(true);
    setScanSuccess(false);

    try {
      // Artificial delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update inputText for highlighting (use the text from active tab)
      onInputChange(textToScan);

      // Perform scan
      const results = scanTextNew(textToScan);

      // Call legacy onScan if provided (for backward compatibility)
      if (onScan) {
        onScan();
      }

      // Call new onScanComplete callback
      if (onScanComplete) {
        onScanComplete(results);
      }

      // Show success animation and toast
      setScanSuccess(true);
      toast.success("Scan completed successfully!");
      setTimeout(() => setScanSuccess(false), 2000);
    } catch (error) {
      console.error("Error during scan:", error);
      toast.error("Failed to scan text. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  // Use external isScanning if provided, otherwise use internal state
  const scanning = externalIsScanning !== undefined ? externalIsScanning : isScanning;

  return (
    <Card variant="elevated" className="shadow-sm">
      <div className="space-y-4">
        {/* Input Type Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setInputType('text');
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              inputType === 'text'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Text</span>
            </div>
          </button>
          <button
            onClick={() => {
              setInputType('document');
              setUrlInput('');
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              inputType === 'document'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Dokument</span>
            </div>
          </button>
          <button
            onClick={() => setInputType('url')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              inputType === 'url'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span>URL</span>
            </div>
          </button>
        </div>

        {/* Text Tab - Textarea */}
        {inputType === 'text' && (
          <>
            {/* Header with Character Counter */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t.app.inputText}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {inputText.length} {t.app.characters}
              </div>
            </div>
            <div
              className={`relative border-2 border-dashed rounded-lg transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-transparent'
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
                <p className="text-sm font-medium text-primary">Drop file here</p>
              </div>
            </div>
          )}

          <textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t.demo.placeholder}
            className={`w-full min-h-[400px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 resize-y font-mono text-sm transition-all ${
              showHighlights && scanResults 
                ? 'text-transparent caret-gray-900 dark:caret-white' 
                : 'dark:text-white'
            }`}
            style={{
              ...(showHighlights && scanResults ? { 
                caretColor: 'currentColor',
              } : {})
            }}
          />
          
          {/* Highlight Overlay - positioned exactly over textarea */}
          {showHighlights && scanResults && inputText && (
            <div
              className="absolute inset-0 z-10 p-4 font-mono text-sm whitespace-pre-wrap break-words overflow-hidden rounded-lg"
              style={{
                lineHeight: '1.5',
                fontFamily: 'JetBrains Mono, monospace',
                pointerEvents: 'none',
              }}
            >
              {renderHighlightedText(inputText, scanResults)}
            </div>
          )}
            </div>
          </>
        )}

        {/* Document Tab - File Upload */}
        {inputType === 'document' && (
          <>
            {/* File Upload Area with Drag & Drop */}
            <div 
              className={`relative border-2 border-dashed rounded-lg transition-colors mb-4 ${
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
                    <p className="text-sm font-medium text-primary">Datei hier ablegen</p>
                  </div>
                </div>
              )}

              {/* File Upload Button */}
              <div className="flex justify-center p-6">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verarbeitung...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Dokument hochladen</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.docx,.pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {/* File Info */}
            {uploadedFile && (
              <div className="flex items-center justify-between p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {uploadedFile.name}
                  </span>
                  {isUploading && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                  )}
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-primary/10 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Document Content Textarea */}
            {uploadedFile && documentText && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Dokument-Inhalt
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {documentText.length} {t.app.characters}
                  </div>
                </div>
                <div className="relative border-2 border-dashed rounded-lg border-transparent">
                  <textarea
                    value={documentText}
                    readOnly
                    className="w-full min-h-[400px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 resize-y font-mono text-sm dark:text-white"
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* URL Tab - URL Input */}
        {inputType === 'url' && (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter URL to scan
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/page"
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUrlSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim() || isFetchingUrl}
                    variant="primary"
                    className="px-6"
                  >
                    {isFetchingUrl ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Fetch
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* URL Content Textarea */}
            {urlText && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    URL-Inhalt{urlInput ? ` von ${urlInput}` : ''}
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {urlText.length} {t.app.characters}
                  </div>
                </div>
                <div className="relative border-2 border-dashed rounded-lg border-transparent">
                  <textarea
                    value={urlText}
                    readOnly
                    className="w-full min-h-[400px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 resize-y font-mono text-sm dark:text-white"
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Templates Dropdown - Only show in Text tab */}
          {inputType === 'text' && (
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <FileText className="w-4 h-4" />
              <span>Templates</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showTemplates && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTemplates(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                  {exampleTemplates.map((template, idx) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleTemplateSelect(template.text)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-sm"
                      >
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{template.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          )}

          {/* Show Highlights Toggle */}
          {scanResults && scanResults.summary.totalFindings > 0 && (
            <button
              onClick={() => setShowHighlights(!showHighlights)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                showHighlights
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              {showHighlights ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide Highlights</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Show Highlights</span>
                </>
              )}
            </button>
          )}

          {/* Clear Button */}
          {((inputType === 'text' && inputText) || 
            (inputType === 'document' && documentText) || 
            (inputType === 'url' && urlText)) && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}

          {/* Scan Button - Prominent, Green */}
          <Button
            onClick={handleScan}
            disabled={
              scanning || 
              (inputType === 'text' && !inputText.trim()) ||
              (inputType === 'document' && !documentText.trim()) ||
              (inputType === 'url' && !urlText.trim())
            }
            className={`ml-auto px-8 py-2.5 text-base font-semibold transition-all ${
              scanning ? "animate-pulse" : ""
            } ${scanSuccess ? "animate-success-flash bg-success" : ""}`}
            variant="primary"
          >
            {scanning ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Scanning...
              </>
            ) : scanSuccess ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Scan Complete
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                {t.app.scanText}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        plan={currentPlan}
      />
    </Card>
  );
};
