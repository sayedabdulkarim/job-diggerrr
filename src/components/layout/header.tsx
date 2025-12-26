'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Pickaxe, User, LogOut, Moon, Sun, FileSearch, Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const { data: session, status } = useSession();
  const [imgError, setImgError] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Jobs', icon: null },
    { href: '/ats-score', label: 'ATS Score', icon: FileSearch },
    { href: '/ai-tools', label: 'AI Tools', icon: Sparkles },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Pickaxe className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:inline">
                JobDiggerrr
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Made with love */}
            <span className="hidden md:flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              <span>by Sayed Abdul Karim</span>
            </span>

            {/* Dark mode toggle */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* Auth */}
            {status === 'loading' ? (
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                {session.user?.image && !imgError ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-7 h-7 rounded-full"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-medium">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-3 py-1.5 bg-gray-900 dark:bg-amber-500 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-amber-400 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
