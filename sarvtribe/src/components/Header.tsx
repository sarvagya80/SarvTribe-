'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import SearchBar from './SearchBar';

export default function Header() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          SarvTribe
        </Link>

        <div className="flex-1 max-w-lg mx-6">
          <SearchBar />
        </div>

        <nav className="flex items-center space-x-4">
          {status === 'loading' && (
            <div className="h-8 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
          )}

          {status === 'authenticated' && (
            <Link
              href="/messages"
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </Link>
          )}

          {status === 'unauthenticated' && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition"
            >
              Log In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
