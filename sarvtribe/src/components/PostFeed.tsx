'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { io } from 'socket.io-client';
import { socket } from '@/lib/prismadb';
import { Post, User, Like, Comment, CommentLike } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import PostCard from "./PostCard";



// A detailed type for a single comment, including its relations
export type CommentType = Comment & {
  user: User;
  likes: CommentLike[];
  replies: CommentType[];
};

// The complete type for a Post, including all its relations
export type PostType = Post & {
  user: User;
  likes: Like[];
  comments: CommentType[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PostFeedProps {
  feedType: 'for-you' | 'following';
}

export default function PostFeed({ feedType }: PostFeedProps) {
  const apiUrl = feedType === 'following' ? '/api/posts/following' : '/api/posts';
  const { data: posts, error, isLoading, mutate } = useSWR<PostType[]>(apiUrl, fetcher);

  useEffect(() => {
    socket.on('post_received', () => mutate());
    socket.on('like_received', () => mutate());
    socket.on('comment_received', () => mutate());

    return () => {
      socket.off('post_received');
      socket.off('like_received');
      socket.off('comment_received');
    };
  }, [mutate]);

  if (error) {
    return (
      <div className="text-center text-red-400 mt-10 font-medium">
        Failed to load posts. Please try again later.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-10 text-sm sm:text-base">
        {feedType === 'following'
          ? "✨ Posts from users you follow will appear here."
          : "🚀 No posts yet. Be the first to share something!"}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <AnimatePresence>
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <PostCard post={post} mutate={mutate} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
