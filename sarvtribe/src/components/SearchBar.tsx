// src/components/SearchBar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: string;
  name: string | null;
  image: string | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Debounce the search input to avoid too many API calls
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        const response = await fetch(`/api/search?q=${query}`);
        const data = await response.json();
        setResults(data);
      } else {
        setResults([]);
      }
    }, 300); // Wait for 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative hidden md:block w-1/3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay hiding results
        placeholder="Search for users..."
        className="w-full px-3 py-1.5 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {isFocused && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <ul>
            {results.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-700 transition-colors"
                >
                  <Image
                    src={user.image || '/default-avatar.jpeg'}
                    alt={user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-white">{user.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}