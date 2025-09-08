'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

interface ImageSearchResult {
  id: number;
  previewURL: string;
  largeImageURL: string;
}

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}

export default function ImageSearchModal({ isOpen, onClose, onImageSelect }: ImageSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      if (query.length > 2) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=image`);
          if (response.ok) {
            const data = await response.json();
            setResults(data || []);
          } else {
            setResults([]);
          }
        } catch {
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Search for an Image
                </Dialog.Title>
                <div className="mt-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search on Pixabay..."
                    className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-md focus:outline-none"
                  />
                </div>
                <div className="mt-4 h-96 overflow-y-auto">
                  {isLoading && <p className="text-gray-500">Loading...</p>}
                  <div className="grid grid-cols-3 gap-2">
                    {results.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => onImageSelect(image.largeImageURL)}
                        className="relative aspect-square group"
                      >
                        <Image
                          src={image.previewURL}
                          alt="Pixabay search result"
                          fill
                          className="object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-bold">Select</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {!isLoading && query.length > 2 && results.length === 0 && (
                    <p className="text-gray-500 mt-4 text-center">No results found.</p>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
