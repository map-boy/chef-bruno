// FILE: src/components/ImageUploader.tsx
import React, { useState, useRef } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  folder: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, currentImage, folder }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    const ext = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(Math.round(p));
      },
      (err) => {
        console.error('Upload error:', err);
        setError('Failed to upload image. Please try again.');
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setPreview(downloadURL);
        onUpload(downloadURL);
        setIsUploading(false);
      }
    );
  };

  const removeImage = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div 
        className={`relative group h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all ${
          preview ? 'border-amber-500 bg-stone-50' : 'border-stone-200 hover:border-amber-400 bg-stone-50/50'
        }`}
      >
        {preview ? (
          <div className="absolute inset-0">
            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full text-stone-900 hover:bg-amber-500 hover:text-white transition-colors"
                title="Replace Image"
              >
                <Upload size={20} />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-white rounded-full text-stone-900 hover:bg-red-500 hover:text-white transition-colors"
                title="Remove Image"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="cursor-pointer flex flex-col items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3 text-amber-600">
                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
              </div>
              <p className="text-sm font-bold text-stone-900 tracking-tight">
                {isUploading ? `Uploading ${progress}%` : 'Click to Upload Image'}
              </p>
              <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-bold">Max 5MB</p>
            </div>
          </>
        )}
        
        {isUploading && (
          <div className="absolute bottom-0 left-0 h-1 bg-amber-600 transition-all duration-300 rounded-b-lg" style={{ width: `${progress}%` }}></div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
      />

      {error && (
        <p className="text-red-500 text-[10px] uppercase font-bold mt-2 tracking-widest">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;
