'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { User } from '@prisma/client';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { TrashIcon } from '@heroicons/react/24/solid';
import { FaceSmileIcon } from '@heroicons/react/24/outline';
import Picker, { Theme } from 'emoji-picker-react'; // Import Theme

interface CommentType {
  id: string;
  body: string;
  createdAt: string;
  user: User;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CommentSheet({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const { data: comments, mutate } = useSWR<CommentType[]>(`/api/posts/${postId}/comments`, fetcher);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newComment }),
    });

    setNewComment('');
    setShowEmojiPicker(false);
    mutate();
  };

  const handleDelete = async (commentId: string) => {
    mutate((currentComments) => currentComments?.filter(c => c.id !== commentId), false);
    await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
  };

  const onEmojiClick = (emojiObject: { emoji: string }) => {
    setNewComment(prevInput => prevInput + emojiObject.emoji);
  };

  return (
    <div className="p-4 mt-4 border-t border-white/10 relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-grow bg-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
        />
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl font-medium text-white transition"
        >
          Post
        </button>
      </form>

      {showEmojiPicker && (
        <div className="absolute bottom-16 right-0 z-50">
          <div className="relative">
            <button
              type="button"
              aria-label="Close emoji picker"
              onClick={() => setShowEmojiPicker(false)}
              className="absolute -top-2 -right-2 z-50 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
            <Picker onEmojiClick={(e) => { onEmojiClick(e); setShowEmojiPicker(false); }} theme={Theme.DARK} />
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {comments?.map((comment) => {
          const isOwner = session?.user?.id === comment.user.id;
          return (
            <div
              key={comment.id}
              className="group flex items-start gap-3"
            >
              <Image
                src={comment.user.image || '/default-avatar.jpeg'}
                alt="avatar"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
              <div className="flex-grow bg-white/5 rounded-2xl px-3 py-2">
                <p className="font-medium text-sm text-white">
                  {comment.user.name}
                </p>
                <p className="text-gray-300 text-sm">{comment.body}</p>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 transition"
                >
                  <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          );
        })}
        {comments?.length === 0 && (
          <p className="text-gray-400 text-sm text-center">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}