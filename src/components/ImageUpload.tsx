'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { UploadCloud } from 'lucide-react';
import { useState } from 'react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={(result) => {
        if (typeof result.info === 'object' && 'secure_url' in result.info) {
          setImageUrl(result.info.secure_url);
          onUpload(result.info.secure_url);
        }
      }}
    >
      {({ open }) => {
        return (
          <div className="flex flex-col items-center gap-4">
            {imageUrl ? (
              <div className="w-48 h-48 brutal-border overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Uploaded Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-48 h-48 brutal-border bg-glass-bg flex items-center justify-center">
                <UploadCloud size={48} className="text-foreground/50" />
              </div>
            )}
            <button 
              type="button" 
              className="brutal-button flex items-center gap-2"
              onClick={() => open()}
            >
              <UploadCloud size={20} />
              {imageUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
          </div>
        );
      }}
    </CldUploadWidget>
  );
}
