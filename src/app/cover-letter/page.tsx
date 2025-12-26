'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Upload, FileText, Loader2, Sparkles, Copy, Check, Lock, Send, RotateCcw } from 'lucide-react';

export default function CoverLetterPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Refinement chat
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementHistory, setRefinementHistory] = useState<string[]>([]);

  // Form fields
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tone, setTone] = useState('professional');

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
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else if (selectedFile) {
      setError('Please upload a PDF file');
    }
  };

  const generateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCoverLetter(null);
    setRefinementHistory([]);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      }
      formData.append('jobDescription', jobDescription);
      formData.append('companyName', companyName);
      formData.append('jobTitle', jobTitle);
      formData.append('tone', tone);

      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      setCoverLetter(data.coverLetter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refineCoverLetter = async () => {
    if (!coverLetter || !refineInput.trim()) return;

    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch('/api/cover-letter/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLetter: coverLetter,
          instruction: refineInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine cover letter');
      }

      setRefinementHistory((prev) => [...prev, coverLetter]);
      setCoverLetter(data.coverLetter);
      setRefineInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRefining(false);
    }
  };

  const undoRefinement = () => {
    if (refinementHistory.length === 0) return;
    const previousVersion = refinementHistory[refinementHistory.length - 1];
    setCoverLetter(previousVersion);
    setRefinementHistory((prev) => prev.slice(0, -1));
  };

  const resetAll = () => {
    setCoverLetter(null);
    setJobDescription('');
    setCompanyName('');
    setJobTitle('');
    setFile(null);
    setRefinementHistory([]);
    setRefineInput('');
  };

// Render upload area
  const renderUploadArea = (compact: boolean) => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg text-center transition-all ${compact ? 'p-3' : 'p-6'} ${
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
        <div className="flex items-center justify-center gap-2">
          <FileText className={`text-green-500 ${compact ? 'w-5 h-5' : 'w-8 h-8'}`} />
          <div className="text-left">
            <p className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-xs' : 'text-sm'}`}>{file.name}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            className="ml-2 text-xs text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <Upload className={`text-gray-400 ${compact ? 'w-5 h-5' : 'w-8 h-8'}`} />
          <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
            Drop resume or click to browse
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${coverLetter ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {/* Hero */}
        <div className="text-center mb-6">
          <h1 className={`font-bold text-gray-900 dark:text-white ${coverLetter ? 'text-2xl mb-1' : 'text-3xl mb-2'}`}>
            AI Cover Letter Generator
          </h1>
          {!coverLetter && (
            <p className="text-gray-500 dark:text-gray-400">
              Generate personalized cover letters tailored to any job
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
              Sign in to Generate Cover Letters
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create personalized, AI-powered cover letters tailored to specific job descriptions.
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
            {!coverLetter && (
              <div className="space-y-6">
                {/* Form */}
                <div className="space-y-4">
                  {/* Resume Upload */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Upload Resume <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                    </h2>
                    {renderUploadArea(false)}
                  </div>

                  {/* Job Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Job Details
                    </h2>
                    <div className="space-y-3">
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Google"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Job Title
                          </label>
                          <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g., Senior Frontend Developer"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Job Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          rows={6}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tone
                        </label>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="professional">Professional</option>
                          <option value="enthusiastic">Enthusiastic</option>
                          <option value="confident">Confident</option>
                          <option value="friendly">Friendly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <div className="text-center">
                  <button
                    onClick={generateCoverLetter}
                    disabled={isGenerating || !jobDescription.trim()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Cover Letter
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Two Column Layout - After Generation */}
            {coverLetter && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Form + Chat */}
                <div className="lg:w-[380px] flex-shrink-0 space-y-4">
                  {/* Compact Form */}
                  <div className="space-y-4">
                    {/* Resume Upload */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Upload Resume <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                      </h2>
                      {renderUploadArea(true)}
                    </div>

                    {/* Job Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Job Details
                      </h2>
                      <div className="space-y-3">
                        <div className="grid gap-3 grid-cols-1">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Company Name
                            </label>
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="e.g., Google"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Job Title
                            </label>
                            <input
                              type="text"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              placeholder="e.g., Senior Frontend Developer"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Job Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            rows={3}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tone
                          </label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="professional">Professional</option>
                            <option value="enthusiastic">Enthusiastic</option>
                            <option value="confident">Confident</option>
                            <option value="friendly">Friendly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Regenerate Button */}
                  <button
                    onClick={generateCoverLetter}
                    disabled={isGenerating || !jobDescription.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Regenerate
                      </>
                    )}
                  </button>

                  {/* Chat Refinement */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Refine your letter
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Ask for changes without regenerating
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refineInput}
                        onChange={(e) => setRefineInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isRefining) {
                            refineCoverLetter();
                          }
                        }}
                        placeholder="e.g., Make it shorter..."
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        disabled={isRefining}
                      />
                      <button
                        onClick={refineCoverLetter}
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
                      {['Shorter', 'More formal', 'Add enthusiasm', 'Less personal'].map((s) => (
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

                {/* Right Column - Cover Letter */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Your Cover Letter
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
                      </div>
                    </div>

                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                        {coverLetter}
                      </div>
                    </div>
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
