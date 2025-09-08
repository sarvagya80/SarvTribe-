'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR, { KeyedMutator } from 'swr';
import { User, Post, StoryHighlight } from '@prisma/client';

// ✅ lucide-react icons
import { UserPlus, UserCheck, MessageCircle, Edit, Share2, Copy } from 'lucide-react';

type UserProfile = User & {
  posts: Post[];
  followersCount: number;
  followingCount: number;
  storyHighlights: StoryHighlight[];
};

interface ProfileHeaderProps {
  user: UserProfile;
  onEdit: () => void;
  mutateProfile: KeyedMutator<UserProfile>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProfileHeader({ user: profileUser, onEdit, mutateProfile }: ProfileHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  const { data: currentUser, mutate: mutateCurrentUser } = useSWR<User & { followingIds: string[] }>(
    session?.user?.id ? `/api/profile/${session.user.id}` : null,
    fetcher
  );

  const isFollowing = currentUser?.followingIds?.includes(profileUser.id);
  const isOwnProfile = currentUser?.id === profileUser.id;

  const handleFollow = async () => {
    if (!session) { router.push('/login'); return; }
    const method = isFollowing ? 'DELETE' : 'POST';

    const optimisticFollowingIds = isFollowing
      ? currentUser?.followingIds.filter(id => id !== profileUser.id)
      : [...(currentUser?.followingIds || []), profileUser.id];
    mutateCurrentUser({ ...currentUser, followingIds: optimisticFollowingIds } as User & { followingIds: string[] }, false);

    const optimisticFollowersCount = isFollowing
      ? profileUser.followersCount - 1
      : profileUser.followersCount + 1;
    mutateProfile({ ...profileUser, followersCount: optimisticFollowersCount }, false);

    await fetch(`/api/users/${profileUser.id}/follow`, { method });
    mutateCurrentUser();
    mutateProfile();
  };

  const handleMessage = async () => {
    if (!session) { router.push('/login'); return; }
    await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: profileUser.id }),
    });
    router.push('/messages');
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileUser.id}`;
    if (navigator.share) {
      await navigator.share({ title: `${profileUser.name}'s Profile on SarvTribe`, url: profileUrl });
    } else {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative text-white">
      {/* Cover Photo */}
      <div className="relative h-36 sm:h-52 w-full overflow-hidden rounded-b-2xl shadow-lg">
        <Image
          src={profileUser.coverPhoto || '/default-cover.png'}
          alt={`${profileUser.name}'s cover photo`}
          fill
          className="object-cover transform transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
      </div>

      {/* Profile Info */}
      <div className="p-4 relative -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl">
            <Image
              src={profileUser.image || '/default-avatar.png'}
              alt={`${profileUser.name}'s profile picture`}
              fill
              className="object-cover"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-1 justify-around sm:justify-start sm:gap-10 mt-2 sm:mt-0">
            <div className="text-center hover:scale-105 transition-transform">
              <p className="font-bold text-lg">{profileUser.posts.length}</p>
              <p className="text-gray-300 text-sm">Posts</p>
            </div>
            <Link href={`/profile/${profileUser.id}/followers`} className="text-center hover:scale-105 transition-transform">
              <p className="font-bold text-lg">{profileUser.followersCount}</p>
              <p className="text-gray-300 text-sm">Followers</p>
            </Link>
            <Link href={`/profile/${profileUser.id}/following`} className="text-center hover:scale-105 transition-transform">
              <p className="font-bold text-lg">{profileUser.followingCount}</p>
              <p className="text-gray-300 text-sm">Following</p>
            </Link>
          </div>
        </div>

        {/* Bio + Info */}
        <div className="mt-4">
          <p className="font-semibold text-2xl">{profileUser.name}</p>
          <p className="text-gray-200 text-sm">{profileUser.bio || 'No bio yet.'}</p>
          <p className="text-gray-400 text-xs mt-1">{profileUser.location || ''}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {isOwnProfile ? (
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
            >
              <Edit size={18} /> Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition ${
                  isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                }`}
              >
                {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={handleMessage}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
              >
                <MessageCircle size={18} /> Message
              </button>
            </>
          )}
          <button
            onClick={handleShareProfile}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {copied ? <Copy size={18} /> : <Share2 size={18} />}
            {copied ? 'Link Copied!' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
