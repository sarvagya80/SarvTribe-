'use client';

import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { XMarkIcon, EllipsisHorizontalIcon, TrashIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface StoryViewerProps {
  initialUserId: string;
  onClose: () => void;
}

export default function StoryViewer({ initialUserId, onClose }: StoryViewerProps) {
  const { data: session } = useSession();
  const { data: allStories, mutate } = useSWR('/api/stories', fetcher);
  
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const usersWithStories = useMemo(() => {
    if (!allStories) return [];
    const userMap = new Map();
    allStories.forEach((story: any) => {
      if (!userMap.has(story.userId)) {
        userMap.set(story.userId, { user: story.user, stories: [] });
      }
      userMap.get(story.userId).stories.push(story);
    });
    return Array.from(userMap.values());
  }, [allStories]);
  
  useEffect(() => {
    const initialIndex = usersWithStories.findIndex((u: any) => u.user.id === initialUserId);
    if (initialIndex !== -1) setActiveUserIndex(initialIndex);
  }, [initialUserId, usersWithStories]);

  const activeUserData = usersWithStories[activeUserIndex];
  const activeStory = activeUserData?.stories[activeStoryIndex];
  const isOwner = activeUserData?.user.id === session?.user?.id;

  const goToNextStory = () => {
    if (activeUserData && activeStoryIndex < activeUserData.stories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else if (activeUserIndex < usersWithStories.length - 1) {
      setActiveUserIndex(prev => prev + 1);
      setActiveStoryIndex(0);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!activeStory) return;
    if (audioRef.current) audioRef.current.pause();
    
    if (activeStory.musicUrl) {
      const audio = new Audio(activeStory.musicUrl);
      audio.muted = isMuted;
      audioRef.current = audio;
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }
    
    const timer = setTimeout(goToNextStory, 7000);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [activeStory, isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      const currentlyMuted = !audioRef.current.muted;
      audioRef.current.muted = currentlyMuted;
      setIsMuted(currentlyMuted);
    }
  };
  
  const goToPrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else if (activeUserIndex > 0) {
      const prevUser = usersWithStories[activeUserIndex - 1];
      setActiveUserIndex(prev => prev - 1);
      setActiveStoryIndex(prevUser.stories.length - 1);
    }
  };
  
  const handleDeleteStory = async () => {
    if (!activeStory || !allStories) return;
    const storyIdToDelete = activeStory.id;
    if (audioRef.current) audioRef.current.pause();

    mutate(allStories.filter((s: any) => s.id !== storyIdToDelete), false);
    await fetch(`/api/stories/${storyIdToDelete}`, { method: 'DELETE' });
    mutate();
  };

  useEffect(() => {
    if (usersWithStories.length > 0 && !activeStory) onClose();
  }, [activeStory, usersWithStories, onClose]);

  if (!activeStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
        
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 flex space-x-1 z-10">
          {activeUserData.stories.map((story: any, index: number) => (
            <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              {index < activeStoryIndex && <div className="h-full bg-white" />}
              {index === activeStoryIndex && (
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 7, ease: 'linear' }}
                  key={activeStory.id}
                />
              )}
            </div>
          ))}
        </div>

        {/* Media */}
        <AnimatePresence>
          <motion.div
            key={activeStory.id}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
          >
            {activeStory.textOverlay && (
              <div className="absolute inset-x-0 bottom-16 flex justify-center px-4 pointer-events-none z-10">
                <p className="text-white text-sm text-center bg-black/50 px-2 py-1 rounded-md">
                  {activeStory.textOverlay}
                </p>
              </div>
            )}
            {activeStory.mediaType === 'IMAGE' ? (
              <Image
                src={activeStory.mediaUrl}
                alt="Story"
                fill
                className="object-contain max-h-full max-w-full"
                style={{ filter: activeStory.filter || 'none' }}
              />
            ) : (
              <video
                src={activeStory.mediaUrl}
                autoPlay
                playsInline
                className="max-h-full max-w-full object-contain"
                style={{ filter: activeStory.filter || 'none' }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* User header */}
        <div className="absolute top-5 left-4 flex items-center space-x-2 z-20">
          <Image
            src={activeUserData.user.image || '/default-avatar.jpeg'}
            alt="avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
          <p className="text-white font-semibold text-sm">{activeUserData.user.name}</p>
        </div>

        {/* Controls */}
        <div className="absolute top-5 right-4 flex items-center space-x-3 z-30">
          {activeStory.musicUrl && (
            <button onClick={toggleMute} className="text-white">
              {isMuted ? (
                <SpeakerXMarkIcon className="w-6 h-6" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6" />
              )}
            </button>
          )}
          {isOwner && (
            <Menu as="div" className="relative">
              <MenuButton className="text-white">
                <EllipsisHorizontalIcon className="w-6 h-6" />
              </MenuButton>
              <Transition
                as={Fragment}
                enter="ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1">
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleDeleteStory}
                          className={`${
                            active ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-gray-200'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          <TrashIcon className="w-5 h-5 mr-2" />
                          Delete Story
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          )}
          <button onClick={onClose} className="text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation zones */}
        <div className="absolute top-0 left-0 w-1/3 h-full z-20" onClick={goToPrevStory} />
        <div className="absolute top-0 right-0 w-1/3 h-full z-20" onClick={goToNextStory} />
      </div>
    </div>
  );
}
