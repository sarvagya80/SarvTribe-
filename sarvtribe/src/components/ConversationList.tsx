'use client';

import useSWR from 'swr';
import ConversationItem from './ConversationItem';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ConversationListProps {
  selectedConversationId: string | null;
  onConversationSelect: (id: string) => void;
}

export default function ConversationList({ selectedConversationId, onConversationSelect }: ConversationListProps) {
  const { data: conversations, error, isLoading } = useSWR('/api/conversations', fetcher);

  return (
    <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
          <Link
            href="/messages/requests"
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Requests
          </Link>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 text-sm">⌕</span>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {isLoading && <p className="text-gray-500 dark:text-gray-400 p-4 text-sm">Loading conversations...</p>}
        {error && <p className="text-red-500 p-4 text-sm">Failed to load conversations.</p>}

        {conversations?.map((conversation: any) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedConversationId}
            onSelect={onConversationSelect}
            hasUnread={conversation.hasUnread}
          />
        ))}

        {!isLoading && !error && conversations?.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 p-4 text-sm text-center">No conversations yet</p>
        )}
      </div>
    </div>
  );
}
