'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { JobFilters } from '@/components/jobs/job-filters';
import { JobList } from '@/components/jobs/job-list';
import { Job } from '@/types';
import { Info } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function Home() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Filters
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [locationType, setLocationType] = useState<'remote' | 'onsite' | 'hybrid' | 'any'>('any');

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Pagination
  const JOBS_PER_PAGE = 25;
  const [currentPage, setCurrentPage] = useState(1);

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  const isLoggedIn = status === 'authenticated';

  const handleSignInPrompt = () => {
    showToast('Please sign in to bookmark jobs', 'info');
    signIn('google');
  };

  useEffect(() => {
    // Check saved preference or system preference
    const saved = localStorage.getItem('jobdiggerrr_theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
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

  // Fetch bookmarks when logged in
  const fetchBookmarks = useCallback(async () => {
    if (!isLoggedIn) {
      setBookmarkedIds([]);
      return;
    }

    try {
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const data = await response.json();
        setBookmarkedIds(data.bookmarks || []);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Toggle bookmark
  const toggleBookmark = async (jobId: string) => {
    if (!isLoggedIn) {
      showToast('Please sign in to bookmark jobs', 'info');
      return;
    }

    const isCurrentlyBookmarked = bookmarkedIds.includes(jobId);

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?jobId=${jobId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setBookmarkedIds((prev) => prev.filter((id) => id !== jobId));
          showToast('Bookmark removed', 'success');
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        });

        if (response.ok) {
          setBookmarkedIds((prev) => [...prev, jobId]);
          showToast('Job bookmarked!', 'success');
        }
      }
    } catch (err) {
      showToast('Failed to update bookmark', 'error');
    }
  };

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const params = new URLSearchParams();

      if (selectedTech.length > 0) {
        params.set('techStack', selectedTech.join(','));
      }

      if (locationType !== 'any') {
        params.set('type', locationType);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTech, locationType]);

  useEffect(() => {
    // Load saved filters from localStorage
    const savedTech = localStorage.getItem('jobdiggerrr_tech');
    const savedLoc = localStorage.getItem('jobdiggerrr_loc');

    if (savedTech) {
      try {
        setSelectedTech(JSON.parse(savedTech));
      } catch {
        // Ignore
      }
    }

    if (savedLoc && ['remote', 'onsite', 'hybrid', 'any'].includes(savedLoc)) {
      setLocationType(savedLoc as typeof locationType);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    setCurrentPage(1); // Reset to first page on filter change
  }, [fetchJobs]);

  // Reset page when bookmark filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [showBookmarksOnly]);

  useEffect(() => {
    // Save filters to localStorage
    localStorage.setItem('jobdiggerrr_tech', JSON.stringify(selectedTech));
    localStorage.setItem('jobdiggerrr_loc', locationType);
  }, [selectedTech, locationType]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero - Compact */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Find Jobs Where Others Aren&apos;t Looking
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1 flex-wrap">
            <span>Everyone searches on</span>
            <span className="relative group">
              <span className="inline-flex items-center gap-0.5 text-gray-400 cursor-help">
                <Info className="w-3.5 h-3.5" />
              </span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                LinkedIn, Indeed, Naukri, Glassdoor, Monster
              </span>
            </span>
            <span className="text-gray-400">•</span>
            <span>We fetch from</span>
            <span className="relative group">
              <span className="inline-flex items-center gap-0.5 text-amber-500 cursor-help">
                <Info className="w-3.5 h-3.5" />
              </span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                RemoteOK, Himalayas, Jobicy, Remotive, Working Nomads, JSearch, Adzuna and more
              </span>
            </span>
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20">
              <JobFilters
                selectedTech={selectedTech}
                locationType={locationType}
                onTechChange={setSelectedTech}
                onLocationChange={setLocationType}
                showBookmarksOnly={showBookmarksOnly}
                onBookmarksFilterChange={setShowBookmarksOnly}
                isLoggedIn={isLoggedIn}
                bookmarkCount={bookmarkedIds.length}
              />
            </div>
          </aside>

          {/* Job List */}
          <div className="flex-1 min-w-0">
            {(() => {
              // Filter by bookmarks if needed
              let filteredJobs = jobs;
              if (showBookmarksOnly) {
                filteredJobs = jobs.filter((job) => {
                  const jobId = job._id || `${job.source}-${job.sourceId}`;
                  return bookmarkedIds.includes(jobId);
                });
              }

              const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
              const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
              const paginatedJobs = filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

              return (
                <>
                  <JobList
                    jobs={paginatedJobs}
                    isLoading={isLoading}
                    error={error}
                    totalCount={filteredJobs.length}
                    bookmarkedIds={bookmarkedIds}
                    onToggleBookmark={toggleBookmark}
                    isLoggedIn={isLoggedIn}
                    onSignInPrompt={handleSignInPrompt}
                  />

                  {/* Pagination */}
                  {!isLoading && totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            if (totalPages <= 7) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 1) return true;
                            return false;
                          })
                          .map((page, idx, arr) => (
                            <span key={page} className="flex items-center">
                              {idx > 0 && arr[idx - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => {
                                  setCurrentPage(page);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                                  currentPage === page
                                    ? 'bg-gray-900 dark:bg-amber-500 text-white dark:text-gray-900'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            </span>
                          ))}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
