// src/components/HashtagRenderer.tsx
'use client';
import Link from 'next/link';

interface HashtagRendererProps {
  text: string;
}

export default function HashtagRenderer({ text }: HashtagRendererProps) {
  const hashtagRegex = /(#\w+)/g;
  const parts = text.split(hashtagRegex);

  return (
    <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
      {parts.map((part, index) => 
        hashtagRegex.test(part) ? (
          <Link 
            key={index}
            href={`/tags/${part.substring(1)}`}
            className="text-indigo-500 hover:underline"
          >
            {part}
          </Link>
        ) : (
          part
        )
      )}
    </p>
  );
}