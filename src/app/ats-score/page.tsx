'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Loader2, Sparkles } from 'lucide-react';

interface ATSResult {
  score: number;
  summary: string;
  good: string[];
  warnings: string[];
  issues: string[];
  keywords: {
    found: string[];
    missing: string[];
  };
  suggestions: string[];
}

export default function ATSScorePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

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
      setResult(null);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const analyzeResume = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/ats-score', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ATS Resume Score Checker
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Upload your resume and get instant ATS compatibility feedback
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
            Free - No Sign In Required
          </span>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
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
            <div className="flex flex-col items-center gap-3">
              <FileText className="w-12 h-12 text-green-500" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                }}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Drop your resume here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse (PDF only)
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Analyze Button */}
        {file && !result && (
          <div className="mt-6 text-center">
            <button
              onClick={analyzeResume}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ATS Score</h2>
                <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}/100
                </span>
              </div>

              {/* Score Bar */}
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreBg(result.score)} transition-all duration-500`}
                  style={{ width: `${result.score}%` }}
                />
              </div>

              <p className="mt-4 text-gray-600 dark:text-gray-400">{result.summary}</p>
            </div>

            {/* Good Points */}
            {result.good.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                  <CheckCircle className="w-5 h-5" />
                  What&apos;s Good
                </h3>
                <ul className="space-y-2">
                  {result.good.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-600 dark:text-amber-400 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  Needs Improvement
                </h3>
                <ul className="space-y-2">
                  {result.warnings.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-amber-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                  <XCircle className="w-5 h-5" />
                  Critical Issues
                </h3>
                <ul className="space-y-2">
                  {result.issues.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-red-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Keywords Analysis
              </h3>

              {result.keywords.found.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Found Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.found.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.keywords.missing.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Consider Adding:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.missing.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
                  <Sparkles className="w-5 h-5" />
                  AI Suggestions
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-blue-500 mt-1">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Try Again */}
            <div className="text-center">
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
                className="text-amber-600 dark:text-amber-400 hover:underline"
              >
                Analyze another resume
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
