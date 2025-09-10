'use client';

import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ExplorePage() {
  const { data: posts, isLoading: loadingPosts } = useSWR('/api/posts', fetcher);
  const { data: users, isLoading: loadingUsers } = useSWR('/api/suggestions', fetcher);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Explore</h1>

      {/* Trending Posts Grid */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Trending Posts</h2>
        {loadingPosts ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {(posts || []).slice(0, 12).map((p: any) => (
              <Link href={`/post/${p.id}`} key={p.id}>
                <div className="relative aspect-square overflow-hidden rounded-md">
                  {p.imageUrl && (
                    <Image src={p.imageUrl} alt="post" fill className="object-cover" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Suggested Users */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Suggested Users</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(users || []).slice(0, 8).map((u: any) => (
            <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Image src={u.image || '/default-avatar.jpeg'} alt={u.name || 'User'} width={36} height={36} className="rounded-full object-cover" />
              <span className="text-sm truncate">{u.name || 'User'}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}