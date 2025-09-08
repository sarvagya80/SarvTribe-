'use client';

import { useState } from 'react';
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <ConversationList
        selectedConversationId={selectedConversationId}
        onConversationSelect={setSelectedConversationId}
      />
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        {selectedConversationId ? (
          <ChatWindow conversationId={selectedConversationId} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a conversation to start chatting
          </p>
        )}
      </div>
    </div>
  );
}
