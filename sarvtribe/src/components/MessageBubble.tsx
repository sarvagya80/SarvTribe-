'use client';

import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import Image from 'next/image';

export default function MessageBubble({ message }: { message: any }) {
  const { data: session } = useSession();
  const isOwnMessage = session?.user?.id === message.sender.id;

  return (
    <div className={clsx('flex w-full mb-2', isOwnMessage ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'flex items-end max-w-xs sm:max-w-md',
          isOwnMessage ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'
        )}
      >
        {!isOwnMessage && (
          <Image
            src={message.sender.image || '/default-avatar.png'}
            alt="avatar"
            width={32}
            height={32}
            className="rounded-full self-start"
          />
        )}
        <div
          className={clsx(
            'rounded-lg shadow-md',
            message.image ? 'p-1' : 'px-3 py-2',
            isOwnMessage ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'
          )}
        >
          {message.image ? (
            <Image
              src={message.image}
              alt="Sent image"
              width={250}
              height={250}
              className="rounded-md object-cover"
            />
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          )}
        </div>
      </div>
    </div>
  );
}
