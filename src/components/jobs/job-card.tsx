'use client';

import { useState } from 'react';
import { Job } from '@/types';
import { MapPin, Clock, ExternalLink, Banknote, Bookmark } from 'lucide-react';

interface JobCardProps {
  job: Job;
  isBookmarked?: boolean;
  onToggleBookmark?: (jobId: string) => void;
  isLoggedIn?: boolean;
  onSignInPrompt?: () => void;
}

// Generate logo URL from company name - try multiple sources
function getCompanyDomain(companyName: string): string {
  // Clean company name and create possible domain
  return companyName
    .toLowerCase()
    .replace(/\s*(gmbh|llc|inc|ltd|corp|co|ag|limited|group|holdings|technologies|technology|software|solutions|consulting)\.?\s*/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function getClearbitLogo(companyName: string): string {
  const domain = getCompanyDomain(companyName);
  return `https://logo.clearbit.com/${domain}.com`;
}

// UI Avatars as reliable fallback - always works
function getUIAvatarLogo(companyName: string): string {
  const initials = companyName
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=fff&size=128&font-size=0.4&bold=true`;
}

export function JobCard({ job, isBookmarked = false, onToggleBookmark, isLoggedIn = false, onSignInPrompt }: JobCardProps) {
  const [imgError, setImgError] = useState(false);
  const [clearbitError, setClearbitError] = useState(false);

  const jobId = job._id || `${job.source}-${job.sourceId}`;

  const logoUrl = job.companyLogo || null;
  const clearbitUrl = getClearbitLogo(job.company);
  const uiAvatarUrl = getUIAvatarLogo(job.company);

  const formatDate = (date: Date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return null;
    const format = (n: number) => {
      if (n >= 1000) return `${Math.round(n / 1000)}k`;
      return n.toString();
    };
    return `$${format(salary.min)}-${format(salary.max)}`;
  };

  const sourceColors: Record<string, string> = {
    remoteok: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    arbeitnow: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    himalayas: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    jsearch: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    adzuna: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    jobicy: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    remotive: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    workingnomads: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800',
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all">
      <div className="flex gap-3">
        {/* Company Logo */}
        <div className="flex-shrink-0 w-12 h-12">
          {/* Try original logo first */}
          {logoUrl && !imgError && (
            <img
              src={logoUrl}
              alt={job.company}
              className="w-12 h-12 rounded-lg object-cover bg-gray-50 dark:bg-gray-700"
              onError={() => setImgError(true)}
            />
          )}

          {/* Fallback to Clearbit */}
          {(!logoUrl || imgError) && !clearbitError && (
            <img
              src={clearbitUrl}
              alt={job.company}
              className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-gray-700"
              onError={() => setClearbitError(true)}
            />
          )}

          {/* Final fallback - UI Avatars (always works) */}
          {(!logoUrl || imgError) && clearbitError && (
            <img
              src={uiAvatarUrl}
              alt={job.company}
              className="w-12 h-12 rounded-lg"
            />
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location.length > 25 ? job.location.slice(0, 25) + '...' : job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(job.postedAt)}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <Banknote className="w-3.5 h-3.5" />
                {formatSalary(job.salary)}
              </span>
            )}
          </div>

          {/* Tags Row */}
          <div className="flex items-center gap-2 mt-2">
            {job.techTags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {tag}
              </span>
            ))}
            {job.techTags.length > 3 && (
              <span className="text-xs text-gray-400">+{job.techTags.length - 3}</span>
            )}
            <span className={`ml-auto text-xs px-2 py-0.5 rounded border ${sourceColors[job.source] || 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>
              {job.source}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 self-center flex items-center gap-2">
          {/* Bookmark Button */}
          {isLoggedIn && onToggleBookmark ? (
            <button
              onClick={() => onToggleBookmark(jobId)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                  : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          ) : (
            <div className="relative group">
              <button
                onClick={onSignInPrompt}
                className="p-2 rounded-lg text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 transition-colors"
                title="Sign in to bookmark"
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Sign in to bookmark
              </span>
            </div>
          )}

          {/* Apply Button */}
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-amber-500 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-amber-400 transition-colors"
          >
            Apply
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
