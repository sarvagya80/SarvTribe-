// src/app/profile/[userId]/followers/page.tsx
'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { User } from '@prisma/client';
import UserListItem from '@/components/UserListItem';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function FollowersPage() {
  const params = useParams();
  const userId = params.userId as string;

  const { data: followers, error, isLoading } = useSWR<Partial<User>[]>(
    userId ? `/api/users/${userId}/followers` : null,
    fetcher
  );

  return (
    <div className="container mx-auto max-w-2xl mt-8 px-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          href={`/profile/${userId}`}
          className="p-2 mr-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-gray-900 dark:text-white"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Followers</h1>
      </div>

      {/* Followers List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading && (
          <p className="text-gray-500 dark:text-gray-400 p-6 text-center">Loading followers...</p>
        )}
        {error && <p className="text-red-500 p-6 text-center">Failed to load followers.</p>}

        {followers?.length ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {followers.map(user => (
              <UserListItem key={user.id} user={user} listType="followers" mutate={() => {}} />
            ))}
          </div>
        ) : (
          !isLoading && !error && (
            <p className="text-gray-500 dark:text-gray-400 p-8 text-center">
              This user has no followers yet.
            </p>
          )
        )}
      </div>
    </div>
  );
}
