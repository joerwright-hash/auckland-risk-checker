"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { scanText } from "@/lib/scanner-logic";
import { toast } from "sonner";
import { Shield, CheckCircle, AlertTriangle, TrendingUp, Users, FileText, Zap, ArrowRight, ChevronDown, Euro, XCircle, Clipboard, Search, BarChart3, ShieldCheck, Leaf, Menu, X, Linkedin, Mail, Loader2, Upload, Link as LinkIcon, File } from "lucide-react";
import Link from "next/link";
import FineCalculatorSection from "@/components/landing/FineCalculator";

// Grid pattern SVG as base64 - extracted to constant to avoid Webpack serialization warnings
const GRID_PATTERN_BG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjAzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+";

export default function LandingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [demoText, setDemoText] = useState(""); // Text from text tab
  const [documentText, setDocumentText] = useState(""); // Text from document
  const [urlText, setUrlText] = useState(""); // Text from URL
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showFAQ, setShowFAQ] = useState<number | null>(null);
  const [inputType, setInputType] = useState<"text" | "document" | "url">("text");
  const [urlInput, setUrlInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to demo section if hash is present on page load
  useEffect(() => {
    if (window.location.hash === '#demo-section') {
      setTimeout(() => {
        const section = document.getElementById('demo-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const handleDemoScan = () => {
    // Get text from the active tab
    let textToScan = "";
    if (inputType === 'text') {
      textToScan = demoText;
    } else if (inputType === 'document') {
      textToScan = documentText;
    } else if (inputType === 'url') {
      textToScan = urlText;
    }

    if (!textToScan.trim()) return;
    
    setIsScanning(true);
    setTimeout(() => {
      const result = scanText(textToScan);
      setDemoResult(result);
      setIsScanning(false);
    }, 800);
  };



  const exampleTexts = [
    "Our product is 100% climate neutral and completely sustainable.",
    "Eco-friendly packaging made from sustainable materials.",
    "Made with 80% recycled materials (certified GRS Standard).",
  ];

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['.txt', '.docx', '.pdf'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Dateigröße überschreitet 5MB Limit' };
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return { valid: false, error: 'Nicht unterstütztes Dateiformat. Bitte laden Sie .txt, .docx oder .pdf hoch' };
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
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (fileExtension === '.pdf') {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0,
        });
        
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const textPages: string[] = [];
        
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str || item.text || '')
            .filter((text: string) => text.trim().length > 0)
            .join(' ');
          
          textPages.push(pageText);
        }
        
        await loadingTask.destroy();
        const fullText = textPages.join('\n\n').trim();
        
        if (!fullText) {
          throw new Error('PDF enthält keinen extrahierbaren Text.');
        }
        
        return fullText;
      } catch (error: any) {
        console.error('PDF parsing error:', error);
        throw new Error('Fehler beim Parsen der PDF. Bitte versuchen Sie es erneut.');
      }
    }

    throw new Error('Nicht unterstützter Dateityp');
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Ungültige Datei');
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const text = await parseFileContent(file);
      const truncatedText = text.slice(0, 500); // Demo limit
      setDocumentText(truncatedText); // Store in documentText, not demoText
      // Don't switch tabs - stay in document tab
      toast.success(`Datei "${file.name}" erfolgreich geladen`);
    } catch (error: any) {
      console.error('Error parsing file:', error);
      toast.error(error.message || 'Fehler beim Parsen der Datei. Bitte versuchen Sie es erneut.');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setDocumentText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch text from URL
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

  const fetchUrlContent = async (url: string): Promise<string> => {
    try {
      const normalizedUrl = normalizeUrl(url);
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Fehler beim Abrufen der URL' }));
        throw new Error(errorData.error || `Fehler beim Abrufen der URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error: any) {
      console.error('Error fetching URL:', error);
      throw error;
    }
  };

  // Handle URL input
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error('Bitte geben Sie eine URL ein');
      return;
    }

    setIsFetchingUrl(true);
    try {
      const normalizedUrl = normalizeUrl(urlInput.trim());
      const text = await fetchUrlContent(normalizedUrl);
      if (!text.trim()) {
        toast.warning('Kein Textinhalt auf der Seite gefunden');
        return;
      }
      const truncatedText = text.slice(0, 500); // Demo limit
      setUrlText(truncatedText); // Store in urlText, not demoText
      setUrlInput(normalizedUrl); // Store normalized URL for display
      // Don't switch tabs - stay in URL tab
      toast.success('URL-Inhalt erfolgreich geladen');
    } catch (error: any) {
      console.error('Error fetching URL content:', error);
      toast.error(error.message || 'Fehler beim Abrufen des URL-Inhalts. Bitte überprüfen Sie die URL und versuchen Sie es erneut.');
    } finally {
      setIsFetchingUrl(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-gray-900">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-16 md:py-24 relative overflow-hidden">
        {/* Subtle grid pattern overlay is handled in CSS via ::before */}
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Badge oben */}
          <div className="text-center mb-4 fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-xs md:text-sm font-medium text-white/90">
              <CheckCircle className="w-4 h-4 text-white" />
              <span>{t.hero.trustBadge || "Basierend auf EU-Richtlinie 2024/825"}</span>
            </div>
          </div>

          {/* Hero Headline & Subheadline */}
          <div className="text-center mb-6 md:mb-8 max-w-4xl mx-auto">
            <div className="fade-in-up">
              <h1 className="mb-4 md:mb-5 text-4xl md:text-5xl lg:text-6xl font-bold text-balance text-white drop-shadow-lg leading-tight">
                Vermeiden Sie Bußgelder bis zu <span className="text-emerald-400">4%</span><br />
                Ihres jährlichen EU-Umsatzes
                <span className="block text-2xl md:text-3xl text-emerald-300 mt-2 font-normal">
                  für Greenwashing-Verstöße
                </span>
              </h1>
            </div>
            
            <div className="fade-in-up-delay-1">
              <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto text-balance mb-6 leading-relaxed">
                Prüfen Sie Ihre Marketing-Aussagen automatisch auf EU-Compliance –{" "}
                <span className="font-semibold text-white">in Sekunden, nicht Stunden.</span>
              </p>
            </div>
          </div>

          {/* Primary CTA mit Trust Signals */}
          <div className="flex flex-col items-center gap-4 mb-8 fade-in-up-delay-2">
            {/* Primary CTA - zum Live-Demo */}
            <button
              onClick={() => {
                document.getElementById('demo-section')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
              className="group relative w-full max-w-md py-5 px-8 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg rounded-xl shadow-xl shadow-emerald-900/50 hover:shadow-2xl hover:shadow-emerald-800/50 transition-all duration-300 hover:scale-105"
            >
              {t.hero.cta || "Jetzt kostenlos prüfen"} →
            </button>
            <p className="block text-xs text-emerald-100 mt-2 font-normal text-center">
              ✓ Keine Anmeldung  ✓ Ergebnis in 30 Sekunden
            </p>

            {/* Secondary Link zum Rechner */}
            <button
              onClick={() => {
                document.getElementById('bussgeld-rechner')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
              className="group mt-6 inline-flex items-center gap-2 text-emerald-200 hover:text-white text-base font-medium transition-all duration-300"
            >
              <span className="border-b-2 border-emerald-400/50 group-hover:border-emerald-400 pb-1 transition-colors">
                Berechnen Sie Ihr persönliches Bußgeld-Risiko
              </span>
              <svg 
                className="w-5 h-5 group-hover:translate-y-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>

          {/* Trust Signals */}
          <div className="mt-12 mb-10 md:mb-12 fade-in-up-delay-3">
            {/* Trust Badges Grid */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-6">
              {/* EU-Konform Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-emerald-700/30 backdrop-blur-sm">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-emerald-200 text-sm font-medium">EU-Richtlinie 2024/825</span>
              </div>

              {/* DSGVO Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-emerald-700/30 backdrop-blur-sm">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-emerald-200 text-sm font-medium">DSGVO-konform</span>
              </div>

              {/* SSL Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-emerald-700/30 backdrop-blur-sm">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-emerald-200 text-sm font-medium">SSL-verschlüsselt</span>
              </div>

              {/* Made in EU Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-emerald-700/30 backdrop-blur-sm">
                <span className="text-emerald-400 text-lg">🇪🇺</span>
                <span className="text-emerald-200 text-sm font-medium">Made in EU</span>
              </div>
            </div>

            {/* Launch Status */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 border border-emerald-500 rounded-full text-emerald-300 text-sm font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Jetzt verfügbar – Keine Warteliste
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo-section" className="relative py-16 md:py-20 overflow-hidden scroll-mt-20">
        {/* Gradient Background - same as Greenwashing-Krise */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('${GRID_PATTERN_BG}')` }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto fade-in-up-delay-4">
            <Card variant="elevated" className="bg-white dark:bg-gray-800 shadow-2xl border-2 border-primary/20">
              <div className="p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-white text-center">
                  Live-Demo: Testen Sie jetzt
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                  Geben Sie Text ein, laden Sie ein Dokument hoch (.txt, .docx, .pdf) oder scannen Sie eine URL
                </p>

                {/* Input Type Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
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

                {/* Textarea - Only shown in respective tabs */}
                {inputType === 'text' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Geben Sie Ihren Marketing-Text ein (max. 500 Zeichen)
                    </label>
                    <textarea
                      value={demoText}
                      onChange={(e) => {
                        const text = e.target.value.slice(0, 500);
                        setDemoText(text);
                      }}
                      placeholder={t.demo.placeholder || "Unser Produkt ist 100% klimaneutral und aus recycelten Materialien hergestellt..."}
                      className="w-full h-40 md:h-48 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white resize-none text-gray-900 text-base shadow-inner transition-all duration-200"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-500">
                        {demoText.length === 0 && <span className="text-primary">Tippen Sie hier, um zu beginnen</span>}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {demoText.length}/500
                      </div>
                    </div>
                  </div>
                )}

                {inputType === 'document' && uploadedFile && documentText && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Dokument-Inhalt (max. 500 Zeichen)
                    </label>
                    <textarea
                      value={documentText}
                      readOnly
                      className="w-full h-40 md:h-48 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none text-gray-900 text-base shadow-inner transition-all duration-200"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-500">
                        <span>Dokument-Inhalt</span>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {documentText.length}/500
                      </div>
                    </div>
                  </div>
                )}

                {inputType === 'url' && urlText && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      URL-Inhalt (max. 500 Zeichen)
                    </label>
                    <textarea
                      value={urlText}
                      readOnly
                      className="w-full h-40 md:h-48 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none text-gray-900 text-base shadow-inner transition-all duration-200"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-500">
                        <span>URL-Inhalt{urlInput ? ` von ${urlInput}` : ''}</span>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {urlText.length}/500
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Tab - File Upload with Drag & Drop */}
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
                          title="Datei entfernen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* URL Tab - URL Input */}
                {inputType === 'url' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL zum Scannen eingeben
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/page"
                        className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-gray-900 text-base"
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
                        isLoading={isFetchingUrl}
                      >
                        {isFetchingUrl ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Lade...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Laden
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Example Texts - Only shown in Text tab */}
                {inputType === 'text' && (
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    <span className="text-xs text-gray-500 self-center mr-2">💡 Beispiele:</span>
                    {exampleTexts.map((text, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDemoText(text.slice(0, 500))}
                        className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        {text.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Compliance prüfen Button - works from all tabs if text is available */}
                <Button
                  onClick={handleDemoScan}
                  isLoading={isScanning}
                  className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={
                    (inputType === 'text' && !demoText.trim()) ||
                    (inputType === 'document' && !documentText.trim()) ||
                    (inputType === 'url' && !urlText.trim())
                  }
                  variant="primary"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Scanne...
                    </>
                  ) : (
                    <>
                      Compliance prüfen →
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Demo Result - Smart Popup mit Teaser und Nudge zur Anmeldung */}
            {demoResult && (
              <Card variant="elevated" className="mt-6 animate-slide-up bg-white dark:bg-gray-800 shadow-2xl border-2 border-primary/20 relative overflow-hidden">
                <div className="p-6 md:p-8 space-y-4">
                  <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="w-6 h-6 text-success" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ihr Scan ist fertig!</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hier ist eine Vorschau Ihrer Ergebnisse
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-gradient-to-r from-danger/10 via-accent/10 to-success/10 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risiko-Score</p>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-3xl font-bold ${
                            demoResult.score >= 70
                              ? "text-danger"
                              : demoResult.score >= 40
                              ? "text-accent"
                              : "text-success"
                          }`}
                        >
                          {demoResult.score}%
                        </span>
                        <span className={`text-sm font-semibold ${
                          demoResult.score >= 70 ? "text-danger" : demoResult.score >= 40 ? "text-accent" : "text-success"
                        }`}>
                          {demoResult.score >= 70 ? "(Hoch)" : demoResult.score >= 40 ? "(Mittel)" : "(Niedrig)"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Potenzielle Verstöße</p>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {demoResult.criticalCount + demoResult.warningCount + demoResult.minorCount}
                      </span>
                    </div>
                  </div>

                  {/* Blurred Details - Nudge zur Anmeldung */}
                  <div className="relative">
                    <div className="blur-sm select-none pointer-events-none opacity-60">
                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-danger font-bold text-lg">{demoResult.criticalCount}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t.demo.critical}</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <span className="text-accent font-bold text-lg">{demoResult.warningCount}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t.demo.warnings}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-success font-bold text-lg">{demoResult.minorCount}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t.demo.minor}</p>
                        </div>
                      </div>
                      {demoResult.findings.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{t.demo.flaggedTerms}:</h4>
                          {demoResult.findings.slice(0, 3).map((f: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                            >
                              <span className="font-mono font-semibold">"{f.term}"</span> - <span className="capitalize">{f.severity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Overlay mit CTA */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg">
                      <div className="text-center p-6 max-w-md">
                        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Detaillierte Analyse verfügbar
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Erhalten Sie vollständige Ergebnisse mit Handlungsempfehlungen, PDF-Bericht und konkreten Lösungsvorschlägen.
                        </p>
                        <Link 
                          href="/auth/signup"
                          onClick={() => {
                            // Save the appropriate text to sessionStorage for auto-scan after registration
                            let textToSave = "";
                            if (inputType === 'text' && demoText.trim()) {
                              textToSave = demoText.trim();
                              sessionStorage.setItem('demoSourceType', 'text');
                            } else if (inputType === 'document' && documentText.trim()) {
                              textToSave = documentText.trim();
                              sessionStorage.setItem('demoSourceType', 'file');
                              if (uploadedFile) {
                                sessionStorage.setItem('demoFileName', uploadedFile.name);
                              }
                            } else if (inputType === 'url' && urlText.trim()) {
                              textToSave = urlText.trim();
                              sessionStorage.setItem('demoSourceType', 'url');
                              if (urlInput.trim()) {
                                sessionStorage.setItem('demoUrl', urlInput.trim());
                              }
                            }
                            
                            if (textToSave) {
                              sessionStorage.setItem('demoTextForScan', textToSave);
                            }
                          }}
                        >
                          <Button variant="primary" className="w-full py-4 text-lg font-semibold shadow-lg mb-3">
                            Kostenlos registrieren für vollständigen Bericht →
                          </Button>
                        </Link>
                        <Link href="#features-section" className="text-sm text-primary hover:underline">
                          Beispiel-Bericht ansehen
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Gradient Background - same as Demo Section */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('${GRID_PATTERN_BG}')` }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Badge ähnlich Hero */}
          <div className="text-center mb-6 fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-emerald-200/50 dark:border-emerald-800/50 rounded-full px-4 py-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <span>{t.problem.title}</span>
            </div>
          </div>

          <h2 className="text-center mb-12 md:mb-16 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Die Greenwashing-Krise
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Statistic 1 */}
            <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-emerald-100/50 dark:border-emerald-900/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-emerald-200 dark:hover:border-emerald-700">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-50/40 to-transparent dark:from-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-8 h-8 text-danger" />
                </div>
                <div className="text-6xl font-bold bg-gradient-to-br from-danger to-red-600 bg-clip-text text-transparent mb-4">{t.problem.stat1.value}</div>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  {t.problem.stat1.description}
                  <span className="block mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {t.problem.stat1.source}
                  </span>
                </p>
              </div>
            </div>

            {/* Statistic 2 */}
            <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-emerald-100/50 dark:border-emerald-900/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-emerald-200 dark:hover:border-emerald-700">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Euro className="w-8 h-8 text-accent" />
                </div>
                <div className="text-6xl font-bold bg-gradient-to-br from-accent to-amber-600 bg-clip-text text-transparent mb-4">{t.problem.stat2.value}</div>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  {t.problem.stat2.description}
                </p>
              </div>
            </div>

            {/* Statistic 3 */}
            <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-emerald-100/50 dark:border-emerald-900/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-emerald-200 dark:hover:border-emerald-700">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="text-6xl font-bold bg-gradient-to-br from-primary to-emerald-600 bg-clip-text text-transparent mb-4">{t.problem.stat3.value}</div>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  {t.problem.stat3.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bußgeld-Rechner Section */}
      <FineCalculatorSection />

      {/* How It Works / Features */}
      <section id="features-section" className="relative py-20 md:py-24 overflow-hidden scroll-mt-20">
        {/* Gradient Background - same as Demo Section */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('${GRID_PATTERN_BG}')` }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-center mb-16 md:mb-20 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t.howItWorks.title}
          </h2>
          
          {/* Timeline - Desktop Horizontal, Mobile Vertical */}
          <div className="max-w-6xl mx-auto">
            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
              {/* Connecting Line */}
              <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-primary">
                <div className="absolute inset-0 bg-primary/20"></div>
              </div>
              
              <div className="grid grid-cols-4 gap-6 relative">
                {[
                  {
                    icon: Clipboard,
                    title: t.howItWorks.step1.title,
                    description: t.howItWorks.step1.description,
                    emoji: "📝"
                  },
                  {
                    icon: Search,
                    title: t.howItWorks.step2.title,
                    description: t.howItWorks.step2.description,
                    emoji: "🔍"
                  },
                  {
                    icon: BarChart3,
                    title: t.howItWorks.step3.title,
                    description: t.howItWorks.step3.description,
                    emoji: "📊"
                  },
                  {
                    icon: ShieldCheck,
                    title: t.howItWorks.step4.title,
                    description: t.howItWorks.step4.description,
                    emoji: "✅"
                  }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="relative animate-fade-in-left"
                    style={{ animationDelay: `${idx * 0.15}s` }}
                  >
                    {/* Step Card */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 hover:-translate-y-1">
                      {/* Step Number Circle */}
                      <div className="relative mb-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border-2 border-primary">
                          <step.icon className="w-10 h-10 text-primary" />
                        </div>
                        {/* Step Number Badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="text-center">
                        <div className="text-3xl mb-3">{step.emoji}</div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Timeline - Vertical */}
            <div className="md:hidden space-y-8">
              {[
                {
                  icon: Clipboard,
                  title: t.howItWorks.step1.title,
                  description: t.howItWorks.step1.description,
                  emoji: "📝"
                },
                {
                  icon: Search,
                  title: t.howItWorks.step2.title,
                  description: t.howItWorks.step2.description,
                  emoji: "🔍"
                },
                {
                  icon: BarChart3,
                  title: t.howItWorks.step3.title,
                  description: t.howItWorks.step3.description,
                  emoji: "📊"
                },
                {
                  icon: ShieldCheck,
                  title: t.howItWorks.step4.title,
                  description: t.howItWorks.step4.description,
                  emoji: "✅"
                }
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="relative animate-fade-in-left"
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  {/* Connecting Line (Mobile) */}
                  {idx < 3 && (
                    <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary/30"></div>
                  )}
                  
                  {/* Step Card */}
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm">
                    <div className="flex items-start gap-4">
                      {/* Step Number Circle */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border-2 border-primary">
                          <step.icon className="w-8 h-8 text-primary" />
                        </div>
                        {/* Step Number Badge */}
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="text-2xl mb-2">{step.emoji}</div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        {/* Gradient Background - same as Demo Section */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url('${GRID_PATTERN_BG}')` }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-center mb-10 md:mb-12 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t.faq.title}
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {t.faq.items.map((faq, idx) => (
                <Card
                  key={idx}
                  variant="outlined"
                  className="cursor-pointer hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200"
                  onClick={() => setShowFAQ(showFAQ === idx ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-base flex-1 text-gray-900 dark:text-white">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                        showFAQ === idx ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {showFAQ === idx && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed animate-slide-up">
                      {faq.answer}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
