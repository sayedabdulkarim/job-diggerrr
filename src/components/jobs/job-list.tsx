'use client';

import { Job } from '@/types';
import { JobCard } from './job-card';
import { Loader2, SearchX } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  isLoading: boolean;
  error?: string;
  totalCount?: number;
  bookmarkedIds?: string[];
  onToggleBookmark?: (jobId: string) => void;
  isLoggedIn?: boolean;
  onSignInPrompt?: () => void;
}

export function JobList({ jobs, isLoading, error, totalCount, bookmarkedIds = [], onToggleBookmark, isLoggedIn = false, onSignInPrompt }: JobListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-500 dark:text-red-400">
        <p className="text-sm">Error: {error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <SearchX className="w-12 h-12 text-gray-300 dark:text-gray-600" />
        <h3 className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No jobs found</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {totalCount && totalCount > 0 ? (
            <><span className="font-medium text-gray-900 dark:text-white">{totalCount}</span> jobs found</>
          ) : (
            <><span className="font-medium text-gray-900 dark:text-white">{jobs.length}</span> jobs found</>
          )}
        </p>
      </div>
      <div className="space-y-3">
        {jobs.map((job, index) => {
          const jobId = job._id || `${job.source}-${job.sourceId}`;
          return (
            <JobCard
              key={`${job.source}-${job.sourceId}-${index}`}
              job={job}
              isBookmarked={bookmarkedIds.includes(jobId)}
              onToggleBookmark={onToggleBookmark}
              isLoggedIn={isLoggedIn}
              onSignInPrompt={onSignInPrompt}
            />
          );
        })}
      </div>
    </div>
  );
}
