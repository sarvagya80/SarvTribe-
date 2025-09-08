'use client';

import useSWR from 'swr';
import { Notification } from '@prisma/client';
import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NotificationsPage() {
  const { data: notifications, error, isLoading, mutate } = useSWR<Notification[]>('/api/notifications', fetcher);
  const router = useRouter();

  const handleNotificationClick = async (notif: Notification) => {
    await fetch(`/api/notifications/${notif.id}`, { method: 'PATCH' });
    mutate(notifications?.map(n => n.id === notif.id ? { ...n, read: true } : n), false);

    if ((notif.type === 'LIKE' || notif.type === 'COMMENT') && notif.postId) {
      router.push(`/post/${notif.postId}`);
    } else if (notif.type === 'FOLLOW') {
      router.push(`/profile/${notif.senderId}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Notifications</h1>
      <div className="space-y-4">
        {isLoading && (
          <p className="text-gray-500 dark:text-gray-400 text-center">Loading notifications...</p>
        )}

        {notifications?.map(notif => (
          <button
            key={notif.id}
            onClick={() => handleNotificationClick(notif)}
            className={clsx(
              "w-full flex items-center space-x-4 p-4 rounded-xl shadow-sm border transition-all duration-200 text-left",
              !notif.read
                ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <div className="flex-shrink-0">
              <Image
                src={notif.senderImage || '/default-avatar.png'}
                alt={notif.senderName}
                width={48}
                height={48}
                className="rounded-full ring-2 ring-white dark:ring-gray-800"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                <span className="font-semibold">{notif.senderName}</span> {notif.body}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDistanceToNowStrict(new Date(notif.createdAt))} ago
              </p>
            </div>

            {!notif.read && (
              <div className="w-3 h-3 bg-indigo-500 rounded-full self-center animate-pulse"></div>
            )}
          </button>
        ))}

        {!isLoading && notifications?.length === 0 && (
          <div className="py-12 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-gray-600 dark:text-gray-400 text-sm">You have no notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
