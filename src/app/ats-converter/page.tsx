'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Upload, FileText, Loader2, Sparkles, Copy, Check, Lock, Send, RotateCcw, ChevronDown, ChevronUp, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ConversionResult {
  convertedResume: string;
  changes: string[];
  addedKeywords: string[];
  tips: string[];
}

export default function ATSConverterPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  // Refinement
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementHistory, setRefinementHistory] = useState<string[]>([]);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jobdiggerrr_theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('jobdiggerrr_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('jobdiggerrr_theme', 'light');
      }
      return newMode;
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setFileUrl(URL.createObjectURL(droppedFile));
      setResult(null);
      setError(null);
      setRefinementHistory([]);
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
      setRefinementHistory([]);
    } else if (selectedFile) {
      setError('Please upload a PDF file');
    }
  };

  const convertResume = async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);
    setRefinementHistory([]);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (targetRole) {
        formData.append('targetRole', targetRole);
      }

      const response = await fetch('/api/ats-converter', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert resume');
      }

      setResult(data);
      // Generate PDF preview
      if (data.convertedResume) {
        const pdfUrl = generatePdf(data.convertedResume);
        setGeneratedPdfUrl(pdfUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result?.convertedResume) return;
    await navigator.clipboard.writeText(result.convertedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate PDF from text
  const generatePdf = useCallback((text: string): string => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;
    const lineHeight = 6;

    doc.setFont('helvetica');

    const lines = text.split('\n');

    for (const line of lines) {
      // Check if it's a section header (all caps)
      if (/^[A-Z][A-Z\s]+$/.test(line.trim()) && line.trim().length > 2) {
        if (y > 20) y += 4; // Add space before section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(line.trim(), margin, y);
        y += lineHeight + 2;
        // Add underline
        doc.setDrawColor(100);
        doc.line(margin, y - 4, pageWidth - margin, y - 4);
      } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        // Bullet points
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const bulletText = line.trim();
        const splitText = doc.splitTextToSize(bulletText, maxWidth - 10);
        for (const splitLine of splitText) {
          if (y > 280) {
            doc.addPage();
            y = margin;
          }
          doc.text(splitLine, margin + 5, y);
          y += lineHeight;
        }
      } else if (line.trim()) {
        // Regular text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(line.trim(), maxWidth);
        for (const splitLine of splitText) {
          if (y > 280) {
            doc.addPage();
            y = margin;
          }
          doc.text(splitLine, margin, y);
          y += lineHeight;
        }
      } else {
        // Empty line
        y += 3;
      }

      // Check if we need a new page
      if (y > 280) {
        doc.addPage();
        y = margin;
      }
    }

    // Generate blob URL for preview
    const pdfBlob = doc.output('blob');
    return URL.createObjectURL(pdfBlob);
  }, []);

  const downloadAsPdf = () => {
    if (!result?.convertedResume) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;
    const lineHeight = 6;

    doc.setFont('helvetica');

    const lines = result.convertedResume.split('\n');

    for (const line of lines) {
      if (/^[A-Z][A-Z\s]+$/.test(line.trim()) && line.trim().length > 2) {
        if (y > 20) y += 4;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(line.trim(), margin, y);
        y += lineHeight + 2;
        doc.setDrawColor(100);
        doc.line(margin, y - 4, pageWidth - margin, y - 4);
      } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const bulletText = line.trim();
        const splitText = doc.splitTextToSize(bulletText, maxWidth - 10);
        for (const splitLine of splitText) {
          if (y > 280) { doc.addPage(); y = margin; }
          doc.text(splitLine, margin + 5, y);
          y += lineHeight;
        }
      } else if (line.trim()) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(line.trim(), maxWidth);
        for (const splitLine of splitText) {
          if (y > 280) { doc.addPage(); y = margin; }
          doc.text(splitLine, margin, y);
          y += lineHeight;
        }
      } else {
        y += 3;
      }
      if (y > 280) { doc.addPage(); y = margin; }
    }

    doc.save('ats-optimized-resume.pdf');
  };

  const downloadAsText = () => {
    if (!result?.convertedResume) return;
    const blob = new Blob([result.convertedResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ats-optimized-resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const refineResume = async () => {
    if (!result?.convertedResume || !refineInput.trim()) return;

    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch('/api/ats-converter/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentResume: result.convertedResume,
          instruction: refineInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine resume');
      }

      setRefinementHistory((prev) => [...prev, result.convertedResume]);
      setResult((prev) => prev ? { ...prev, convertedResume: data.convertedResume } : null);
      setRefineInput('');
      // Regenerate PDF preview
      if (data.convertedResume) {
        const pdfUrl = generatePdf(data.convertedResume);
        setGeneratedPdfUrl(pdfUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRefining(false);
    }
  };

  const undoRefinement = () => {
    if (refinementHistory.length === 0 || !result) return;
    const previousVersion = refinementHistory[refinementHistory.length - 1];
    setResult((prev) => prev ? { ...prev, convertedResume: previousVersion } : null);
    setRefinementHistory((prev) => prev.slice(0, -1));
    // Regenerate PDF for previous version
    const pdfUrl = generatePdf(previousVersion);
    setGeneratedPdfUrl(pdfUrl);
  };

  const resetAll = () => {
    setFile(null);
    setFileUrl(null);
    setResult(null);
    setTargetRole('');
    setRefinementHistory([]);
    setRefineInput('');
    setShowDetails(false);
    if (generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl);
      setGeneratedPdfUrl(null);
    }
  };

// Render form content based on compact mode
  const renderUploadArea = (compact: boolean) => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl text-center transition-all ${compact ? 'p-4' : 'p-8'} ${
        isDragging
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
          : file
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
      }`}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {file ? (
        <div className="flex flex-col items-center gap-2">
          <FileText className={`text-green-500 ${compact ? 'w-8 h-8' : 'w-12 h-12'}`} />
          <p className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
              setFileUrl(null);
              setResult(null);
            }}
            className="text-xs text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className={`text-gray-400 ${compact ? 'w-8 h-8' : 'w-12 h-12'}`} />
          <p className={`font-medium text-gray-700 dark:text-gray-300 ${compact ? 'text-sm' : 'text-lg'}`}>
            Drop your resume here
          </p>
          <p className="text-xs text-gray-500">or click to browse (PDF only)</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${result ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {/* Hero */}
        <div className="text-center mb-6">
          <h1 className={`font-bold text-gray-900 dark:text-white ${result ? 'text-2xl mb-1' : 'text-3xl mb-2'}`}>
            ATS Resume Converter
          </h1>
          {!result && (
            <p className="text-gray-500 dark:text-gray-400">
              Convert your resume to an ATS-optimized format
            </p>
          )}
          {!isLoggedIn && status !== 'loading' && (
            <span className="inline-block mt-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm rounded-full">
              Sign In Required
            </span>
          )}
        </div>

        {/* Not Logged In State */}
        {!isLoggedIn && status !== 'loading' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Lock className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sign in to Convert Your Resume
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Transform your resume into an ATS-friendly format that gets past automated screening systems.
            </p>
            <button
              onClick={() => signIn('google')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}

        {/* Logged In */}
        {isLoggedIn && (
          <>
            {/* Initial State - Centered Form */}
            {!result && (
              <div className="space-y-6">
                {/* Upload Form */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Upload Your Resume
                    </h2>
                    {renderUploadArea(false)}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Target Role <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g., Senior Frontend Developer"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* Convert Button */}
                {file && (
                  <div className="text-center">
                    <button
                      onClick={convertResume}
                      disabled={isConverting}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Convert to ATS Format
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Two Column Layout - After Conversion */}
            {result && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Form + Chat */}
                <div className="lg:w-[380px] flex-shrink-0 space-y-4">
                  {/* Compact Form */}
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Original Resume
                      </h2>
                      {fileUrl ? (
                        <div className="space-y-2">
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                            <iframe
                              src={`${fileUrl}#toolbar=0&navpanes=0`}
                              className="w-full h-48"
                              title="Original Resume Preview"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate">{file?.name}</p>
                            <button
                              onClick={resetAll}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      ) : (
                        renderUploadArea(true)
                      )}
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Target Role <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="e.g., Senior Frontend Developer"
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reconvert Button */}
                  <button
                    onClick={convertResume}
                    disabled={isConverting || !file}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Reconvert
                      </>
                    )}
                  </button>

                  {/* Chat Refinement */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Refine your resume
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Ask for changes without reconverting
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refineInput}
                        onChange={(e) => setRefineInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isRefining) {
                            refineResume();
                          }
                        }}
                        placeholder="e.g., Add more keywords..."
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        disabled={isRefining}
                      />
                      <button
                        onClick={refineResume}
                        disabled={isRefining || !refineInput.trim()}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRefining ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {['Add more keywords', 'Make shorter', 'More achievements', 'Add metrics'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setRefineInput(s)}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Changes & Tips */}
                  {(result.changes?.length > 0 || result.tips?.length > 0) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between p-3 text-left"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Changes & Tips
                        </span>
                        {showDetails ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {showDetails && (
                        <div className="px-3 pb-3 space-y-3">
                          {result.changes?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Changes:</p>
                              <ul className="space-y-0.5">
                                {result.changes.map((c, i) => (
                                  <li key={i} className="text-xs text-gray-500 flex gap-1">
                                    <span className="text-green-500">•</span> {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.addedKeywords?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Keywords:</p>
                              <div className="flex flex-wrap gap-1">
                                {result.addedKeywords.map((kw, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {result.tips?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tips:</p>
                              <ul className="space-y-0.5">
                                {result.tips.map((t, i) => (
                                  <li key={i} className="text-xs text-gray-500 flex gap-1">
                                    <span className="text-amber-500">{i + 1}.</span> {t}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Start Over */}
                  <button
                    onClick={resetAll}
                    className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
                  >
                    Start over
                  </button>
                </div>

                {/* Right Column - Converted Resume */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        ATS-Optimized Resume
                      </h2>
                      <div className="flex items-center gap-2">
                        {refinementHistory.length > 0 && (
                          <button
                            onClick={undoRefinement}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                            title="Undo last change"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Undo
                          </button>
                        )}
                        <button
                          onClick={copyToClipboard}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={downloadAsPdf}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg transition-colors"
                        >
                          <FileDown className="w-4 h-4" />
                          Download PDF
                        </button>
                      </div>
                    </div>

                    {/* Resume Preview - PDF */}
                    {generatedPdfUrl ? (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                        <iframe
                          src={`${generatedPdfUrl}#toolbar=0&navpanes=0`}
                          className="w-full h-[70vh]"
                          title="Converted Resume PDF Preview"
                        />
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-h-[70vh] overflow-y-auto shadow-inner">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {result.convertedResume.split('\n').map((line, i) => {
                            // Section headers (all caps)
                            if (/^[A-Z][A-Z\s]+$/.test(line.trim()) && line.trim().length > 2) {
                              return (
                                <h3 key={i} className="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                                  {line}
                                </h3>
                              );
                            }
                            // Bullet points
                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                              return (
                                <p key={i} className="text-sm text-gray-700 dark:text-gray-300 ml-4 my-0.5">
                                  {line}
                                </p>
                              );
                            }
                            // Empty lines
                            if (!line.trim()) {
                              return <div key={i} className="h-2" />;
                            }
                            // Regular text
                            return (
                              <p key={i} className="text-sm text-gray-700 dark:text-gray-300 my-0.5">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
