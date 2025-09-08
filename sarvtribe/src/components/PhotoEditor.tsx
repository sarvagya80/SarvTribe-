'use client';

import Script from 'next/script';

interface PhotoEditorProps {
  onSave: (file: File) => void;
  onClose: () => void;
}

export default function PhotoEditor({ onSave, onClose }: PhotoEditorProps) {
  const initializePixo = () => {
    // Check if the Pixo script has loaded
    if ((window as any).Pixo) {
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
      editor.edit(); // Launch the editor immediately
    }
  };

  return (
    <Script
      src="https://pixoeditor.com/editor/scripts/bridge.js"
      strategy="lazyOnload"
      onLoad={initializePixo}
    />
  );
}