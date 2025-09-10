'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
  HeartIcon as HeartIconSolid,
  EllipsisHorizontalIcon,
  SpeakerWaveIcon,
  PlayCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import {
  HeartIcon as HeartIconOutline,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import { PostType } from './PostFeed';
import { formatDistanceToNow } from 'date-fns';
import HashtagRenderer from './HashtagRenderer';
import Picker, { Theme } from 'emoji-picker-react';

interface PostCardProps {
  post: PostType;
  mutate: (data?: any, options?: any) => Promise<any>;
}

export default function PostCard({ post, mutate }: PostCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { id: postId, user: author, body: caption, likes, createdAt, imageUrl, videoUrl, musicUrl, comments } =
    post;
  const { name: authorName, image: authorAvatar } = author;

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const currentUserId = session?.user?.id;
  const hasLiked =
    currentUserId && (likes || []).some((like) => like.userId === currentUserId);
  const isOwner = session?.user?.id === author.id;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const postCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!musicUrl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !audioRef.current) {
          audioRef.current = new Audio(musicUrl);
          audioRef.current.loop = true;
          audioRef.current.onpause = () => setIsPlaying(false);
          audioRef.current.onplaying = () => setIsPlaying(true);
        }
      },
      { threshold: 0.5 }
    );
    if (postCardRef.current) observer.observe(postCardRef.current);
    return () => {
      observer.disconnect();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error('Playback failed:', e));
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    const optimisticLikes = hasLiked
      ? likes.filter((like) => like.userId !== currentUserId)
      : [
          ...(likes || []),
          { userId: currentUserId, postId, id: 'optimistic-id', createdAt: new Date() },
        ];
    const optimisticPost = { ...post, likes: optimisticLikes };
    await mutate(
      (currentPosts: PostType[] | undefined) =>
        currentPosts?.map((p) => (p.id === postId ? optimisticPost : p)),
      { revalidate: false }
    );
    const method = hasLiked ? 'DELETE' : 'POST';
    await fetch(`/api/posts/${postId}/like`, { method });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;
    await mutate(
      (currentPosts: PostType[] | undefined) => currentPosts?.filter((p) => p.id !== postId),
      { revalidate: false }
    );
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      await navigator.share({ title: `Post by ${authorName}`, url: postUrl });
    } else {
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newComment }),
    });

    setNewComment('');
    setShowEmojiPicker(false);
    mutate(); // Refresh post to include new comment
  };

  const onEmojiClick = (emojiObject: { emoji: string }) => {
    setNewComment((prevInput) => prevInput + emojiObject.emoji);
  };

  return (
    <motion.div
      ref={postCardRef}
      layout
      className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${author.id}`}>
            <Image
              src={authorAvatar || '/default-avatar.jpeg'}
              alt={`${authorName}'s avatar`}
              width={40}
              height={40}
              className="rounded-full object-cover"
              key={authorAvatar}
            />
          </Link>
          <div>
            <Link href={`/profile/${author.id}`}>
              <p className="font-semibold text-gray-900 dark:text-white hover:underline">
                {authorName}
              </p>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
          </div>
        </div>

        {isOwner && (
          <Menu as="div" className="relative">
            <MenuButton className="text-gray-500 dark:text-gray-400">
              <EllipsisHorizontalIcon className="w-6 h-6" />
            </MenuButton>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 w-48 z-10 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleDelete}
                        className={`${
                          active
                            ? 'bg-red-500 text-white'
                            : 'text-gray-900 dark:text-gray-200'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        <TrashIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                        Delete
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        )}
      </div>

      {/* Post Media & Music Overlay */}
      {imageUrl && (
        <div className="relative w-full aspect-square group">
          <Image src={imageUrl} alt="Post content" fill className="object-cover" />
          {musicUrl && (
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <SpeakerWaveIcon className="w-16 h-16 text-white/80" />
              ) : (
                <PlayCircleIcon className="w-20 h-20 text-white/80" />
              )}
            </button>
          )}
        </div>
      )}

      {videoUrl && (
        <div className="relative w-full aspect-square group">
          <video 
            src={videoUrl} 
            controls 
            className="w-full h-full object-cover"
            preload="metadata"
          />
          {musicUrl && (
            <button
              onClick={togglePlayPause}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            >
              {isPlaying ? (
                <SpeakerWaveIcon className="w-6 h-6" />
              ) : (
                <PlayCircleIcon className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4 relative">
        <div className="flex space-x-4 text-gray-800 dark:text-gray-200">
          <motion.button onClick={handleLike} whileTap={{ scale: 0.9 }}>
            {hasLiked ? (
              <HeartIconSolid className="w-7 h-7 text-red-500" />
            ) : (
              <HeartIconOutline className="w-7 h-7" />
            )}
          </motion.button>
          <Link href={`/post/${postId}`}>
            <ChatBubbleOvalLeftIcon className="w-7 h-7" />
          </Link>
          <button onClick={handleShare}>
            <ShareIcon className="w-7 h-7" />
          </button>
        </div>

        <p className="font-semibold mt-3">{(likes || []).length.toLocaleString()} likes</p>

        {/* Caption */}
        {caption && (
          <div className="mt-1 text-sm">
            <Link href={`/profile/${author.id}`} className="font-semibold mr-2">
              {authorName}
            </Link>
            <HashtagRenderer text={caption} />
          </div>
        )}

        {/* Comments Preview */}
        <div className="mt-3 space-y-2">
          {comments &&
            comments.slice(0, 2).map((comment: any) => (
              <div key={comment.id} className="text-sm">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="font-semibold mr-2"
                >
                  {comment.user.name}
                </Link>
                <span>{comment.body}</span>
              </div>
            ))}
        </div>

        {comments && comments.length > 2 && (
          <Link href={`/post/${postId}`} className="mt-2 text-sm text-gray-500">
            View all {comments.length} comments
          </Link>
        )}

        {/* Comment Input */}
        <form
          onSubmit={handleCommentSubmit}
          className="mt-3 flex items-center border-t border-gray-200 dark:border-gray-700 pt-3"
        >
          <Image
            src={session?.user?.image || '/default-avatar.jpeg'}
            alt="Your avatar"
            width={32}
            height={32}
            className="rounded-full object-cover"
            key={session?.user?.image}
          />
          <div className="flex-grow flex items-center bg-gray-100 dark:bg-gray-800 rounded-full mx-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-grow bg-transparent focus:outline-none px-3 py-1"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2"
            >
              <FaceSmileIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <button
            type="submit"
            className="text-indigo-500 font-semibold disabled:text-gray-400"
            disabled={!newComment.trim()}
          >
            Post
          </button>
        </form>

        {/* Emoji Picker */}
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
      </div>
    </motion.div>
  );
}
