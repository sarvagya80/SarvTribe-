'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface PhotoEditorProps {
  onSave: (file: File) => void;
  onClose: () => void;
  imageFile?: File | null;
}

export default function PhotoEditor({ onSave, onClose, imageFile }: PhotoEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializePixo = () => {
    // Check if the Pixo script has loaded
    if ((window as any).Pixo) {
      try {
        const editor = new (window as any).Pixo.editor({
          apikey: process.env.NEXT_PUBLIC_PIXO_API_KEY,
          onSave: (result: any) => {
            // Pixo returns a blob, we convert it to a File object
            const imageFile = new File([result.toBlob()], "edited-image.png", { type: 'image/png' });
            onSave(imageFile);
          },
          onClose: () => {
            onClose();
          }
        });
        
        // If we have an image file, load it into the editor
        if (imageFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            editor.edit(dataUrl); // Launch the editor with the image
          };
          reader.readAsDataURL(imageFile);
        } else {
          editor.edit(); // Launch the editor without an image
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Pixo initialization error:', err);
        setError('Failed to initialize photo editor');
        setIsLoading(false);
      }
    } else {
      setError('Photo editor failed to load');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set a timeout to show error if Pixo doesn't load
    const timeout = setTimeout(() => {
      if (isLoading) {
        setError('Photo editor is taking too long to load');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Editor</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Editor</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading photo editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Script
      src="https://pixoeditor.com/editor/scripts/bridge.js"
      strategy="lazyOnload"
      onLoad={initializePixo}
    />
  );
}