'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { Story } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function StoryArchivePage() {
  const router = useRouter();
  const { data: stories, isLoading } = useSWR<Story[]>('/api/stories/archive', fetcher);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [highlightTitle, setHighlightTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const toggleStorySelection = (storyId: string) => {
    setSelectedStoryIds(prev =>
      prev.includes(storyId) ? prev.filter(id => id !== storyId) : [...prev, storyId]
    );
  };

  const handleCreateHighlight = async () => {
    if (!selectedStoryIds.length || !highlightTitle.trim()) {
      alert('Please select at least one story and provide a title.');
      return;
    }

    const coverStory = stories?.find(story => story.id === selectedStoryIds[0]);
    if (!coverStory) return;

    setIsCreating(true);
    await fetch('/api/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: highlightTitle,
        coverUrl: coverStory.mediaUrl,
        storyIds: selectedStoryIds,
      }),
    });

    setIsCreating(false);
    router.push('/');
  };

  return (
    <div className="container mx-auto max-w-4xl mt-6 px-4">
      <div className="flex items-center mb-4">
        <Link href="/" className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Story Archive</h1>
      </div>

      {selectedStoryIds.length > 0 && (
        <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center space-x-2 sticky top-24 z-10">
          <input
            type="text"
            value={highlightTitle}
            onChange={e => setHighlightTitle(e.target.value)}
            placeholder="Highlight name..."
            className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded-md focus:outline-none"
          />
          <button
            onClick={handleCreateHighlight}
            disabled={isCreating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold disabled:bg-indigo-400"
          >
            {isCreating ? 'Creating...' : 'Create Highlight'}
          </button>
        </div>
      )}

      {isLoading && <p>Loading archive...</p>}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {stories?.map(story => (
          <div
            key={story.id}
            className="relative aspect-square rounded-md overflow-hidden cursor-pointer"
            onClick={() => toggleStorySelection(story.id)}
          >
            <Image src={story.mediaUrl} alt="Archived Story" fill className="object-cover" />
            {selectedStoryIds.includes(story.id) && (
              <div className="absolute inset-0 border-4 border-indigo-500 bg-black/50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                  ✓
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
