'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { FileSearch, FileText, FileOutput, Sparkles } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    title: 'ATS Resume Score',
    description: 'Check how well your resume performs with Applicant Tracking Systems',
    icon: FileSearch,
    href: '/ats-score',
    color: 'green',
    badge: 'Free',
    badgeColor: 'green',
  },
  {
    title: 'Cover Letter Generator',
    description: 'Generate personalized cover letters tailored to specific job descriptions',
    icon: FileText,
    href: '/cover-letter',
    color: 'blue',
    badge: 'Sign In',
    badgeColor: 'amber',
  },
  {
    title: 'ATS Resume Converter',
    description: 'Convert your resume to an ATS-optimized format',
    icon: FileOutput,
    href: '/ats-converter',
    color: 'purple',
    badge: 'Sign In',
    badgeColor: 'amber',
  },
];

export default function AIToolsPage() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jobdiggerrr_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: 'text-green-500',
      },
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: 'text-blue-500',
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        icon: 'text-purple-500',
      },
    };
    return colors[color] || colors.green;
  };

  const getBadgeClasses = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI-Powered Tools
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Supercharge your job search with our suite of AI tools designed to help you stand out
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const colorClasses = getColorClasses(tool.color);
            const Icon = tool.icon;

            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-lg"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colorClasses.bg} mb-4`}>
                  <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {tool.title}
                  </h2>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getBadgeClasses(tool.badgeColor)}`}>
                    {tool.badge}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            More AI tools coming soon...
          </p>
        </div>
      </main>
    </div>
  );
}
