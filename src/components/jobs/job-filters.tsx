'use client';

import { TECH_STACKS } from '@/types';
import { X, Bookmark } from 'lucide-react';

interface JobFiltersProps {
  selectedTech: string[];
  locationType: 'remote' | 'onsite' | 'hybrid' | 'any';
  onTechChange: (tech: string[]) => void;
  onLocationChange: (loc: 'remote' | 'onsite' | 'hybrid' | 'any') => void;
  showBookmarksOnly?: boolean;
  onBookmarksFilterChange?: (show: boolean) => void;
  isLoggedIn?: boolean;
  bookmarkCount?: number;
}

export function JobFilters({
  selectedTech,
  locationType,
  onTechChange,
  onLocationChange,
  showBookmarksOnly = false,
  onBookmarksFilterChange,
  isLoggedIn = false,
  bookmarkCount = 0,
}: JobFiltersProps) {
  const toggleTech = (tech: string) => {
    if (selectedTech.includes(tech)) {
      onTechChange(selectedTech.filter((t) => t !== tech));
    } else {
      onTechChange([...selectedTech, tech]);
    }
  };

  const clearAll = () => {
    onTechChange([]);
    onLocationChange('any');
    onBookmarksFilterChange?.(false);
  };

  const hasFilters = selectedTech.length > 0 || locationType !== 'any' || showBookmarksOnly;

  return (
    <div className="space-y-4">
      {/* Selected Filters */}
      {hasFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters</span>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedTech.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded"
              >
                {tech}
                <button onClick={() => toggleTech(tech)} className="hover:text-blue-600 dark:hover:text-blue-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {locationType !== 'any' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded capitalize">
                {locationType}
                <button onClick={() => onLocationChange('any')} className="hover:text-green-600 dark:hover:text-green-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {showBookmarksOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-medium rounded">
                Bookmarks
                <button onClick={() => onBookmarksFilterChange?.(false)} className="hover:text-amber-600 dark:hover:text-amber-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks Filter - Only show when logged in */}
      {isLoggedIn && onBookmarksFilterChange && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <button
            onClick={() => onBookmarksFilterChange(!showBookmarksOnly)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              showBookmarksOnly
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Bookmark className={`w-4 h-4 ${showBookmarksOnly ? 'fill-current' : ''}`} />
              My Bookmarks
            </span>
            {bookmarkCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                showBookmarksOnly
                  ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {bookmarkCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Work Type */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Type</h4>
        <div className="flex flex-wrap gap-1.5">
          {(['any', 'remote', 'onsite', 'hybrid'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onLocationChange(type)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                locationType === type
                  ? 'bg-gray-900 dark:bg-amber-500 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type === 'any' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tech Stack</h4>
        <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto">
          {TECH_STACKS.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedTech.includes(tech)
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
