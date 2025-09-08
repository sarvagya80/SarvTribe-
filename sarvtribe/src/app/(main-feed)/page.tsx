'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import StoryBar from '@/components/StoryBar';
import CreatePost from '@/components/CreatePost';
import PostFeed from '@/components/PostFeed';
import StoryViewer from '@/components/StoryViewer';

type FeedTab = 'for-you' | 'following';

export default function HomePage() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
  const [viewingStoryUserId, setViewingStoryUserId] = useState<string | null>(null);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <>
        {viewingStoryUserId && (
          <StoryViewer
            initialUserId={viewingStoryUserId}
            onClose={() => setViewingStoryUserId(null)}
          />
        )}
        <div className="py-6 px-4 sm:px-0">
          <StoryBar onStoryClick={setViewingStoryUserId} />
          <CreatePost />
          <div className="flex border-b border-gray-200 dark:border-gray-700 mt-6">
            {(['for-you', 'following'] as FeedTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-1/2 py-3 font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-gray-900 dark:text-white border-b-2 border-indigo-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab === 'for-you' ? 'For You' : 'Following'}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <PostFeed feedType={activeTab} />
          </div>
        </div>
      </>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to SarvTribe</h1>
      <Link href="/login" className="mt-6 text-indigo-400 hover:underline">
        Please Sign In
      </Link>
    </main>
  );
}
