'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import MessageBubble from './MessageBubble';
import { useSession } from 'next-auth/react';
import Picker, { Theme } from 'emoji-picker-react';

// ✅ Lucide icons
import {
  PlusCircle,
  Image as ImageIcon,
  Smile,
  Mic,
  Send,
} from 'lucide-react';
import { socket } from '@/lib/prismadb';

const fetcher = async (url: string): Promise<unknown> => {
  const res = await fetch(url);
  return res.json();
};

interface ChatWindowProps {
  conversationId: string | null;
}

interface MessageType {
  id: string;
  body?: string;
  image?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { data: messages, error, isLoading, mutate } = useSWR<MessageType[]>(
    conversationId ? `/api/messages/${conversationId}` : null,
    fetcher
  );

  useEffect(() => {
    if (conversationId && messages && messages.length > 0) {
      fetch(`/api/conversations/${conversationId}/seen`, {
        method: 'POST',
      }).then(() => globalMutate('/api/conversations'));
    }
  }, [conversationId, messages]);

  useEffect(() => {
    if (conversationId) {
      socket.emit('join_conversation', conversationId);
      const handleNewMessage = (newMsg: MessageType) => {
        mutate(
          (currentMessages: MessageType[] = []) => [...currentMessages, newMsg],
          false
        );
      };
      socket.on('message_received', handleNewMessage);
      return () => socket.off('message_received', handleNewMessage);
    }
  }, [conversationId, mutate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !session?.user) return;

    const optimisticMessage: MessageType = {
      id: 'optimistic-' + Date.now(),
      body: newMessage,
      createdAt: new Date().toISOString(),
      sender: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      },
    };
    mutate(
      (currentMessages: MessageType[] = []) => [
        ...currentMessages,
        optimisticMessage,
      ],
      false
    );

    await fetch(`/api/messages/${conversationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newMessage }),
    });

    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiObject: { emoji: string }) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  const handleImageSend = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'sarvtribe_preset');

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) return;

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    const cloudinaryData = await cloudinaryRes.json();
    const imageUrl = cloudinaryData.secure_url;

    if (imageUrl && conversationId) {
      await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }),
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSend(file);
  };

  if (!conversationId) {
    return (
      <div className="hidden md:flex flex-grow items-center justify-center">
        <div className="text-center text-gray-400">
          <h2 className="text-2xl font-bold">Your Messages</h2>
          <p>Select a conversation to start chatting.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="flex-grow p-4">Loading messages...</div>;
  if (error) return <div className="flex-grow p-4">Failed to load messages.</div>;

  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <p className="font-semibold">Chat</p>
      </div>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages?.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-0 z-10">
            <Picker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
          </div>
        )}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1"
        >
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="flex-grow bg-transparent text-gray-900 dark:text-white focus:outline-none px-2"
          />

          {newMessage.trim() ? (
            <button
              type="submit"
              className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Mic className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Smile className="w-6 h-6" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
