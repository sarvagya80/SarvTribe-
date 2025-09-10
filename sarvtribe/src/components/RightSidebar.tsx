'use client';

import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RightSidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: suggestions, mutate } = useSWR<User[]>('/api/suggestions', fetcher);

  const handleFollow = async (targetUserId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    // Optimistic UI update
    const updatedSuggestions = suggestions?.filter(user => user.id !== targetUserId);
    mutate(updatedSuggestions, false);

    await fetch(`/api/users/${targetUserId}/follow`, { method: 'POST' });
  };

  if (!session?.user) return null;

  return (
    <aside className="hidden lg:block w-80 p-4">
      <div className="sticky top-4 space-y-6">
        {/* Current User Card */}
        <div className="p-4 rounded-2xl bg-black border border-gray-800 shadow-md">
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${session.user.id}`}>
              <Image
                src={session.user.image || '/default-avatar.jpeg'}
                alt="Your avatar"
                width={56}
                height={56}
                className="rounded-full object-cover border border-gray-700"
                key={session.user.image}
              />
            </Link>
            <div>
              <p className="font-bold text-white text-sm">{session.user.name}</p>
              <p className="text-xs text-gray-400">@you</p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="p-4 rounded-2xl bg-black border border-gray-800 shadow-md">
          <p className="text-white font-semibold mb-4 text-sm">Suggested for you</p>
          <div className="space-y-3">
            {suggestions?.map((user: User) => (
              <div
                key={user.id}
                className="flex items-center justify-between hover:bg-gray-900 p-2 rounded-lg transition"
              >
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center space-x-2"
                >
                  <Image
                    src={user.image || '/default-avatar.jpeg'}
                    alt={user.name || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-gray-700"
                    key={user.image}
                  />
                  <p className="font-medium text-xs text-white hover:text-pink-400 transition">
                    {user.name}
                  </p>
                </Link>
                <button
                  onClick={() => handleFollow(user.id)}
                  className="px-3 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shadow hover:opacity-90 transition"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
