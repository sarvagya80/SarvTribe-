'use client';

import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
// Local lightweight type compatible with multiple post shapes
type PostGridPost = {
  id: string;
  imageUrl: string | null;
  likes?: unknown[];
  comments?: unknown[];
  likesCount?: number;
  commentsCount?: number;
};

interface PostGridProps {
  posts: PostGridPost[];
}

export default function PostGrid({ posts }: PostGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map(post => (
        <Link href={`/post/${post.id}`} key={post.id}>
          <div
            className="relative aspect-square group overflow-hidden rounded-md"
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
                  <Heart size={18} className="text-white" fill="white" /> {(post.likes?.length ?? post.likesCount) ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={18} /> {(post.comments?.length ?? post.commentsCount) ?? 0}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}