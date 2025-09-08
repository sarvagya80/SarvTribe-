'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatDistanceToNowStrict } from 'date-fns';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { CommentType } from '@/components/PostFeed'; // Import our new type

interface CommentItemProps {
  comment: CommentType;
  postId: string;
  mutate: () => void;
}

function CommentItemComponent({ comment, postId, mutate }: CommentItemProps) {
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');

  const currentUserId = session?.user?.id;
  const isOwner = comment.user.id === currentUserId;
  const hasLiked = comment.likes?.some((like) => like.userId === currentUserId);

  const handleLike = async () => {
    const method = hasLiked ? 'DELETE' : 'POST';
    await fetch(`/api/comments/${comment.id}/like`, { method });
    mutate();
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure?')) return;
    await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
    mutate();
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyBody, parentId: comment.id }),
    });

    setReplyBody('');
    setIsReplying(false);
    mutate();
  };

  return (
    <div className="flex items-start space-x-3">
      <Image
        src={comment.user.image || '/default-avatar.png'}
        alt={comment.user.name || 'User avatar'}
        width={32}
        height={32}
        className="rounded-full"
      />
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Link
              href={`/profile/${comment.user.id}`}
              className="font-semibold hover:underline"
            >
              {comment.user.name}
            </Link>
            <p className="text-xs text-gray-400">
              {formatDistanceToNowStrict(new Date(comment.createdAt))} ago
            </p>
          </div>
          <p className="mt-1 text-sm">{comment.body}</p>
        </div>
        <div className="flex items-center space-x-3 text-xs mt-1 text-gray-400">
          <button
            type="button"
            onClick={handleLike}
            className="font-semibold flex items-center space-x-1"
          >
            {hasLiked ? (
              <HeartIconSolid className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIconOutline className="w-4 h-4" />
            )}
            <span>{comment.likes?.length || 0}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsReplying(!isReplying)}
            className="font-semibold"
          >
            Reply
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              className="font-semibold text-red-500"
            >
              Delete
            </button>
          )}
        </div>

        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm p-2 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 text-xs rounded-md bg-indigo-500 text-white hover:bg-indigo-600"
            >
              Post
            </button>
          </form>
        )}

        {/* Render nested replies recursively */}
        {comment.replies?.length > 0 && (
          <div className="ml-6 mt-2 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItemComponent
                key={reply.id}
                comment={reply}
                postId={postId}
                mutate={mutate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentItemComponent;
