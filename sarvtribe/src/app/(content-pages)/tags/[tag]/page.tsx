// src/app/tags/[tag]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import PostCard from '@/components/PostCard';
import { PostType } from '@/components/PostFeed';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TagPage() {
  const params = useParams();
  const tag = params.tag as string;

  const { data: posts, error, isLoading, mutate } = useSWR<PostType[]>(
    tag ? `/api/tags/${tag}` : null,
    fetcher
  );

  return (
    <div className="container mx-auto max-w-xl mt-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Posts tagged with <span className="text-indigo-500">#{decodeURIComponent(tag)}</span>
      </h1>
      
      {isLoading && <p>Loading posts...</p>}
      {error && <p>Failed to load posts.</p>}
      
      <div className="space-y-6">
        {posts?.map(post => (
          <PostCard key={post.id} post={post} mutate={mutate} />
        ))}
      </div>
    </div>
  );
}