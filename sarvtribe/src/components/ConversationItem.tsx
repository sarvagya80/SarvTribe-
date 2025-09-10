'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useMemo } from 'react';
import { User } from '@prisma/client';
import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';

interface ConversationItemProps {
  conversation: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  hasUnread: boolean;
}

export default function ConversationItem({ conversation, isSelected, onSelect, hasUnread }: ConversationItemProps) {
  const session = useSession();

  const otherUser = useMemo(() => {
    const currentUserEmail = session.data?.user?.email;
    return conversation.participants.find((user: User) => user.email !== currentUserEmail);
  }, [session.data?.user?.email, conversation.participants]);

  const lastMessage = conversation.messages?.[0];

  const lastMessageTime = useMemo(() => {
    if (conversation.lastMessageAt) {
      return formatDistanceToNowStrict(new Date(conversation.lastMessageAt));
    }
    return '';
  }, [conversation.lastMessageAt]);

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={clsx(
        `w-full px-4 py-3 flex items-center gap-3 cursor-pointer 
         transition-all duration-200 border-b border-white/5`,
        isSelected 
          ? 'bg-white/10 backdrop-blur-md' 
          : 'hover:bg-white/5'
      )}
    >
      {/* Avatar */}
      <Image
        src={otherUser?.image || '/default-avatar.jpeg'}
        alt={`${otherUser?.name}'s avatar`}
        width={48}
        height={48}
        className="rounded-full object-cover shadow-sm"
      />

      {/* Name + message */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-white truncate">{otherUser?.name}</p>
          {lastMessageTime && (
            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
              {lastMessageTime}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-300 truncate">
          {lastMessage ? lastMessage.body : "Start a conversation"}
        </p>
      </div>

      {/* Status + icon */}
      <div className="flex items-center gap-2">
        {hasUnread && (
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
        )}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className="w-5 h-5 text-gray-400 hover:text-indigo-400 transition"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      </div>
    </div>
  );
}
