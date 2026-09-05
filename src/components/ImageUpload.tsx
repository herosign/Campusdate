'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImageUrl?: string | null;
}

export default function ImageUpload({ onUpload, currentImageUrl }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (under 10MB)
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError(null);

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);
    setProgress(20);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary environment configuration missing.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'jac_mate_profiles');

      setProgress(45);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      setProgress(85);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Failed to upload photo to server.');
      }

      const data = await response.json();
      setProgress(100);
      setPreviewUrl(data.secure_url);
      onUpload(data.secure_url);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset input value so same file can be re-selected if needed
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Hidden file inputs: one standard (gallery), one with capture for camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preview Box */}
      <div className="relative w-48 h-56 brutal-border overflow-hidden bg-foreground/5 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        {previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewUrl}
            alt="Profile Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center opacity-40 font-mono text-xs">
            <ImageIcon size={40} className="mb-2" />
            <span>NO IMAGE SELECTED</span>
          </div>
        )}

        {/* Uploading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center space-y-2">
            <Loader2 size={32} className="animate-spin text-white" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              UPLOADING ({progress}%)
            </span>
            <div className="w-full bg-white/20 h-1.5 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="brutal-border bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 p-2 font-mono text-xs flex items-center gap-2 max-w-sm">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons: Camera & Gallery */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="brutal-button text-xs py-2 px-3 flex items-center gap-1.5 disabled:opacity-50"
          title="Take photo using camera"
        >
          <Camera size={15} />
          <span>Camera</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="brutal-button text-xs py-2 px-3 flex items-center gap-1.5 disabled:opacity-50"
          title="Choose photo from phone gallery or files"
        >
          <ImageIcon size={15} />
          <span>{previewUrl ? 'Change Photo' : 'Gallery / Files'}</span>
        </button>
      </div>

      {previewUrl && !uploading && (
        <span className="font-mono text-[11px] opacity-60 flex items-center gap-1 text-green-700 dark:text-green-400 font-bold">
          <CheckCircle2 size={13} /> PHOTO LINKED
        </span>
      )}
    </div>
  );
}
