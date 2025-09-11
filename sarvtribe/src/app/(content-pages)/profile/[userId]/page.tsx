'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import ProfileHeader from '@/components/ProfileHeader';
import PostGrid from '@/components/PostGrid';
import EditProfileModal from '@/components/EditProfileModal';
import { User, StoryHighlight } from '@prisma/client';
import { Squares2X2Icon, HeartIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Fetcher helper
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Define PostType to match what PostGrid expects
export type PostType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  body: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  hashtags: string[];
  musicUrl: string | null;
  filter: string | null;
  textOverlay: string | null;
  textPosition: string | null;
  likesCount?: number;
  commentsCount?: number;
  user?: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  };
};

type UserProfile = User & {
  posts: PostType[];
  followersCount: number;
  followingCount: number;
  storyHighlights: StoryHighlight[];
};

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: user, error, isLoading, mutate } = useSWR<UserProfile>(
    userId ? `/api/profile/${userId}` : null,
    fetcher
  );

  const { data: likedPosts, isLoading: areLikesLoading } = useSWR<PostType[]>(
    activeTab === 'liked' && userId ? `/api/users/${userId}/likes` : null,
    fetcher
  );

  const isOwnProfile = user?.id === session?.user?.id;

  const handleDeleteHighlight = async (highlightId: string) => {
    if (!window.confirm('Are you sure you want to delete this highlight?')) return;

    mutate(
      {
        ...user,
        storyHighlights: user!.storyHighlights.filter(h => h.id !== highlightId),
      } as UserProfile,
      false
    );

    await fetch(`/api/highlights/${highlightId}`, { method: 'DELETE' });
    mutate();
  };

  if (isLoading)
    return <div className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading profile...</div>;

  if (error || !user)
    return <div className="text-center mt-10 text-red-500 dark:text-red-400">User not found.</div>;

  return (
    <>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />

      <div className="container mx-auto max-w-4xl">
        {/* Profile Header */}
        <ProfileHeader user={user} onEdit={() => setIsEditModalOpen(true)} mutateProfile={mutate} />

        {/* Story Highlights */}
        {user.storyHighlights && user.storyHighlights.length > 0 && (
          <div className="px-4 py-4 flex space-x-6 overflow-x-auto scrollbar-hide my-6 border-t border-b border-gray-200 dark:border-gray-700">
            {user.storyHighlights.map(highlight => (
              <div key={highlight.id} className="text-center relative flex-shrink-0">
                {isOwnProfile && (
                  <button
                    onClick={() => handleDeleteHighlight(highlight.id)}
                    className="absolute -top-1 -right-1 z-10 bg-gray-200 dark:bg-gray-900 rounded-full shadow-sm"
                  >
                    <XCircleIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors" />
                  </button>
                )}
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full p-1 ring-2 ring-gray-300 dark:ring-gray-600">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={highlight.coverUrl}
                      alt={highlight.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <p className="text-xs mt-2 text-gray-700 dark:text-gray-300 truncate w-20">
                  {highlight.title}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center space-x-12">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center space-x-2 py-4 px-2 -mt-px text-sm font-medium tracking-wide ${
                activeTab === 'posts'
                  ? 'text-gray-900 dark:text-white border-t-2 border-gray-900 dark:border-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
              <span>Posts</span>
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex items-center space-x-2 py-4 px-2 -mt-px text-sm font-medium tracking-wide ${
                activeTab === 'liked'
                  ? 'text-gray-900 dark:text-white border-t-2 border-gray-900 dark:border-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <HeartIcon className="w-5 h-5" />
              <span>Liked</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          user.posts.length > 0 ? (
            <PostGrid posts={user.posts} />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No posts yet.</p>
          )
        )}
        {activeTab === 'liked' && (
          areLikesLoading ? (
            <p className="text-center mt-6 text-gray-500 dark:text-gray-400">Loading liked posts...</p>
          ) : likedPosts && likedPosts.length > 0 ? (
            <PostGrid posts={likedPosts} />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No liked posts yet.</p>
          )
        )}
      </div>
    </>
  );
}
