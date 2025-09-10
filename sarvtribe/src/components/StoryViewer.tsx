'use client';

import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { XMarkIcon, EllipsisHorizontalIcon, TrashIcon, SpeakerWaveIcon, SpeakerXMarkIcon, HeartIcon, EyeIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isMuted, setIsMuted] = useState(false);
  const [videoDuration, setVideoDuration] = useState(7); // Default 7 seconds for images
  const [progress, setProgress] = useState(0); // Progress percentage (0-100)
  const [isLiked, setIsLiked] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const [storyViews, setStoryViews] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    
    // Reset progress
    setProgress(0);
    
    // Set duration based on media type
    if (activeStory.mediaType === 'VIDEO') {
      // For videos, we'll get the duration from the video element
      setVideoDuration(7); // Default fallback
    } else {
      setVideoDuration(7); // Images show for 7 seconds
    }
    
    if (activeStory.musicUrl) {
      const audio = new Audio(activeStory.musicUrl);
      audio.muted = isMuted;
      audioRef.current = audio;
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }
    
    // Start progress tracking
    if (activeStory.mediaType === 'IMAGE') {
      // For images, use a simple timer
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progressPercent = Math.min((elapsed / 7000) * 100, 100);
        setProgress(progressPercent);
        
        if (progressPercent >= 100) {
          goToNextStory();
        } else {
          progressIntervalRef.current = setTimeout(updateProgress, 50);
        }
      };
      progressIntervalRef.current = setTimeout(updateProgress, 50);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearTimeout(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [activeStory, isMuted]);

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && !isNaN(video.duration)) {
      setVideoDuration(video.duration);
    }
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && !isNaN(video.duration)) {
      const progressPercent = (video.currentTime / video.duration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleVideoEnded = () => {
    setProgress(100);
    goToNextStory();
  };

  // Track story view when story changes
  useEffect(() => {
    if (activeStory && session?.user?.id) {
      // Record view
      fetch(`/api/stories/${activeStory.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(console.error);

      // Check if current user liked this story
      const userLiked = activeStory.likes?.some((like: any) => like.userId === session.user.id);
      setIsLiked(!!userLiked);
    }
  }, [activeStory, session?.user?.id]);

  const handleLikeStory = async () => {
    if (!activeStory || !session?.user?.id) return;

    try {
      if (isLiked) {
        // Unlike
        const response = await fetch(`/api/stories/${activeStory.id}/like`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setIsLiked(false);
        }
      } else {
        // Like
        const response = await fetch(`/api/stories/${activeStory.id}/like`, {
          method: 'POST',
        });
        if (response.ok) {
          setIsLiked(true);
        }
      }
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleShowViews = async () => {
    if (!activeStory || !isOwner) return;

    try {
      const response = await fetch(`/api/stories/${activeStory.id}/views`);
      if (response.ok) {
        const views = await response.json();
        setStoryViews(views);
        setShowViews(true);
      }
    } catch (error) {
      console.error('Error fetching story views:', error);
    }
  };

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
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
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
                ref={videoRef}
                src={activeStory.mediaUrl}
                autoPlay
                playsInline
                muted={isMuted}
                className="max-h-full max-w-full object-contain"
                style={{ filter: activeStory.filter || 'none' }}
                onEnded={handleVideoEnded}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onTimeUpdate={handleVideoTimeUpdate}
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
            className="rounded-full object-cover"
          />
          <p className="text-white font-semibold text-sm">{activeUserData.user.name}</p>
          <span className="text-white/70 text-xs">
            {new Date(activeStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Story interactions */}
        <div className="absolute bottom-20 right-4 flex flex-col space-y-4 z-30">
          {/* Like button */}
          <button
            onClick={handleLikeStory}
            className="flex items-center space-x-2 text-white hover:scale-110 transition-transform"
          >
            <HeartIcon className={`w-8 h-8 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} />
            <span className="text-sm font-medium">{activeStory.likes?.length || 0}</span>
          </button>

          {/* Views button (only for story owner) */}
          {isOwner && (
            <button
              onClick={handleShowViews}
              className="flex items-center space-x-2 text-white hover:scale-110 transition-transform"
            >
              <EyeIcon className="w-8 h-8" />
              <span className="text-sm font-medium">{activeStory.views?.length || 0}</span>
            </button>
          )}
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

      {/* Story Views Modal */}
      {showViews && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Story Views</h3>
              <button
                onClick={() => setShowViews(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {storyViews.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No views yet</p>
              ) : (
                storyViews.map((view) => (
                  <div key={view.id} className="flex items-center space-x-3">
                    <Image
                      src={view.user.image || '/default-avatar.jpeg'}
                      alt={view.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {view.user.name || view.user.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(view.viewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
