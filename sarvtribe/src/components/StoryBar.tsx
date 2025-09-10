'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface StoryBarProps {
  onStoryClick: (userId: string) => void;
}

export default function StoryBar({ onStoryClick }: StoryBarProps) {
  const { data: session } = useSession();
  const { data: stories } = useSWR('/api/stories', fetcher);

  const storiesByUser = useMemo(() => {
    if (!stories) return [];
    const userMap = new Map();
    stories.forEach((story: any) => {
      if (!userMap.has(story.userId)) {
        userMap.set(story.userId, { user: story.user });
      }
    });
    return Array.from(userMap.values());
  }, [stories]);

  return (
    <div className="w-full px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {/* Add Story */}
        {session?.user && (
          <Link href="/stories/create" className="flex-shrink-0 text-center w-16">
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition">
              <PlusIcon className="w-7 h-7 text-pink-500" />
            </div>
            <p className="text-xs mt-1 text-gray-700 dark:text-gray-300">Add</p>
          </Link>
        )}

        {/* Stories */}
        {storiesByUser.map((userStoryGroup: any) => (
          <button
            key={userStoryGroup.user.id}
            className="flex-shrink-0 text-center w-16 focus:outline-none"
            onClick={() => onStoryClick(userStoryGroup.user.id)}
          >
            <div className="relative w-16 h-16 p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500">
              <div className="w-full h-full rounded-full bg-white dark:bg-black p-[2px]">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={userStoryGroup.user.image || '/default-avatar.jpeg'}
                    alt={userStoryGroup.user.name}
                    fill
                    className="object-cover rounded-full"
                    key={userStoryGroup.user.image}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs mt-1 text-gray-800 dark:text-gray-300 truncate">
              {userStoryGroup.user.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
