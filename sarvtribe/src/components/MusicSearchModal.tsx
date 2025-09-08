'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlayIcon, CheckIcon, StopIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl60: string;
  previewUrl: string;
}

interface MusicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackSelect: (track: { title: string; audioUrl: string }) => void;
}

export default function MusicSearchModal({
  isOpen,
  onClose,
  onTrackSelect,
}: MusicSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen && audio) {
      audio.pause();
      setPlayingTrackId(null);
    }
  }, [isOpen, audio]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(
              query
            )}&country=IN&media=music&entity=song&limit=20`
          );
          if (response.ok) {
            const data = await response.json();
            setResults(data.results || []);
          }
        } catch (err) {
          console.error('Music fetch failed:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handlePreview = (track: Track) => {
    if (audio && playingTrackId === track.trackId) {
      audio.pause();
      setPlayingTrackId(null);
    } else {
      if (audio) audio.pause();
      const newAudio = new Audio(track.previewUrl);
      setAudio(newAudio);
      newAudio.play().catch((err) => console.error('Playback failed:', err));
      setPlayingTrackId(track.trackId);
      newAudio.onended = () => setPlayingTrackId(null);
    }
  };

  const handleSelect = (track: Track) => {
    if (audio) audio.pause();
    onTrackSelect({ title: track.trackName, audioUrl: track.previewUrl });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              {/* Title */}
              <Dialog.Title
                as="h3"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Add Music
              </Dialog.Title>

              {/* Search Input */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for songs..."
                className="mt-3 w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-md focus:outline-none text-gray-900 dark:text-gray-100"
              />

              {/* Results */}
              <div className="mt-4 h-80 overflow-y-auto">
                {isLoading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading music...
                  </p>
                )}

                <div className="space-y-2">
                  {results.map((track) => (
                    <div
                      key={track.trackId}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      {/* Artwork */}
                      <Image
                        src={track.artworkUrl60}
                        alt={track.trackName}
                        width={48}
                        height={48}
                        className="rounded-md"
                      />

                      {/* Play / Stop Button */}
                      <button
                        onClick={() => handlePreview(track)}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                      >
                        {playingTrackId === track.trackId ? (
                          <StopIcon className="w-5 h-5 text-gray-800 dark:text-gray-100" />
                        ) : (
                          <PlayIcon className="w-5 h-5 text-gray-800 dark:text-gray-100" />
                        )}
                      </button>

                      {/* Track Info */}
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold truncate text-gray-900 dark:text-gray-100">
                          {track.trackName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {track.artistName}
                        </p>
                      </div>

                      {/* Select Button */}
                      <button
                        onClick={() => handleSelect(track)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {!isLoading && results.length === 0 && query.length > 2 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No results found.
                  </p>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
