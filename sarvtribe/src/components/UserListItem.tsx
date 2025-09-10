// src/components/UserListItem.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

interface UserListItemProps {
  user: Partial<User>;
  listType: 'followers' | 'following';
  mutate: () => void;
}

export default function UserListItem({ user, listType, mutate }: UserListItemProps) {
  const router = useRouter();

  const handleMessage = async () => {
    await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: user.id }),
    });
    router.push('/messages');
  };

  const handleRemove = async () => {
    mutate();

    if (listType === 'following') {
      await fetch(`/api/users/${user.id}/follow`, { method: 'DELETE' });
    } else {
      await fetch(`/api/users/${user.id}/followers`, { method: 'DELETE' });
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <Link href={`/profile/${user.id}`} className="flex items-center space-x-3">
        <Image
          src={user.image || '/default-avatar.jpeg'}
          alt={user.name || 'User'}
          width={44}
          height={44}
          className="rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
        </div>
      </Link>
      <div className="flex space-x-2">
        <button
          onClick={handleMessage}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          Message
        </button>
        <button
          onClick={handleRemove}
          className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-colors"
        >
          {listType === 'following' ? 'Unfollow' : 'Remove'}
        </button>
      </div>
    </div>
  );
}
