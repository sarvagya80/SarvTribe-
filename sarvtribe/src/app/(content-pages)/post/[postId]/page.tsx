'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import PostCard from '@/components/PostCard';
import { PostType } from '@/components/PostFeed';
import Link from 'next/link';
import CommentItem from '@/components/CommentItem';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PostPage() {
  const params = useParams();
  const postId = params.postId as string;

  const { data: post, error, isLoading, mutate } = useSWR<PostType>(
    postId ? `/api/post/${postId}` : null,
    fetcher
  );

  if (isLoading)
    return <div className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading post...</div>;

  if (error || !post)
    return <div className="text-center mt-10 text-red-500 dark:text-red-400">Post not found.</div>;

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline mb-6 inline-flex items-center gap-1"
      >
        <span className="text-lg">&larr;</span> Back to feed
      </Link>

      {/* Post */}
      <PostCard post={post} mutate={mutate} />

      {/* Comments Section */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          All Comments ({post.comments.length})
        </h2>

        {post.comments.length > 0 ? (
          <div className="space-y-4">
            {post.comments.map((comment: any) => (
              <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}
