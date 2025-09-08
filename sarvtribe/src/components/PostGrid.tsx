// src/components/PostGrid.tsx
'use client';
import Image from 'next/image';
import { Post } from '@prisma/client';
import { Heart, MessageCircle } from 'lucide-react';

interface PostGridProps {
  posts: Post[];
}

export default function PostGrid({ posts }: PostGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
      {posts.map(post => (
        <div
          key={post.id}
          className="relative aspect-square group overflow-hidden rounded-md sm:rounded-lg shadow-md"
        >
          {post.imageUrl && (
            <Image
              src={post.imageUrl}
              alt="User post"
              fill
              priority
              className="object-cover transform transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold">
            <div className="flex gap-6">
              <span className="flex items-center gap-1">
                <Heart size={18} className="text-red-400" /> {post.likesCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={18} /> {post.commentsCount || 0}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
