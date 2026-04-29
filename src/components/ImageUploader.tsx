// PATH: src-app/components/ImageUploader.tsx
// ALSO COPY TO: src/components/ImageUploader.tsx

import React, { useState, useRef, useCallback } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, X, ZoomIn, ZoomOut, Move, Loader2, RotateCcw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  onUpload: (url: string, position?: { x: number; y: number; zoom: number }) => void;
  currentImage?: string;
  folder: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, currentImage, folder }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Position state: x/y = object-position percent, zoom = scale
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [zoom, setZoom] = useState(1);

  // Drag-to-reposition state
  const isDraggingImage = useRef(false);
  const dragStartRef = useRef({ mx: 0, my: 0, px: 50, py: 50 });
  const frameRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Validate & preview file ───────────────────────── */
  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
      setPendingFile(file);
      setPosX(50);
      setPosY(50);
      setZoom(1);
      setIsAdjusting(true);
    };
    reader.readAsDataURL(file);
  };

  /* ── File input (click) ─────────────────────────────── */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  /* ── Drag & drop from computer ──────────────────────── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }, []);

  /* ── Drag to reposition image ───────────────────────── */
  const onMouseDown = (e: React.MouseEvent) => {
    if (!isAdjusting) return;
    e.preventDefault();
    isDraggingImage.current = true;
    dragStartRef.current = { mx: e.clientX, my: e.clientY, px: posX, py: posY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStartRef.current.mx) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.my) / rect.height) * 100;
    setPosX(Math.max(0, Math.min(100, dragStartRef.current.px - dx)));
    setPosY(Math.max(0, Math.min(100, dragStartRef.current.py - dy)));
  };

  const onMouseUp = () => { isDraggingImage.current = false; };

  // Touch support
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isAdjusting) return;
    const t = e.touches[0];
    isDraggingImage.current = true;
    dragStartRef.current = { mx: t.clientX, my: t.clientY, px: posX, py: posY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingImage.current || !frameRef.current) return;
    const t = e.touches[0];
    const rect = frameRef.current.getBoundingClientRect();
    const dx = ((t.clientX - dragStartRef.current.mx) / rect.width) * 100;
    const dy = ((t.clientY - dragStartRef.current.my) / rect.height) * 100;
    setPosX(Math.max(0, Math.min(100, dragStartRef.current.px - dx)));
    setPosY(Math.max(0, Math.min(100, dragStartRef.current.py - dy)));
  };

  const onTouchEnd = () => { isDraggingImage.current = false; };

  /* ── Upload to Firebase ─────────────────────────────── */
  const uploadToFirebase = () => {
    if (!pendingFile) return;
    setIsUploading(true);
    setError(null);
    setProgress(0);

    const ext = pendingFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, pendingFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      (err) => {
        console.error('Upload error:', err);
        setError('Upload failed. Please try again.');
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setPreview(downloadURL);
        setPendingFile(null);
        setIsAdjusting(false);
        setIsUploading(false);
        onUpload(downloadURL, { x: posX, y: posY, zoom });
      }
    );
  };

  /* ── Remove image ───────────────────────────────────── */
  const removeImage = () => {
    setPreview(null);
    setPendingFile(null);
    setIsAdjusting(false);
    setPosX(50); setPosY(50); setZoom(1);
    onUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetPosition = () => { setPosX(50); setPosY(50); setZoom(1); };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="w-full select-none">

      {/* DROP ZONE — shown when no image loaded */}
      {!preview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-amber-500 bg-amber-50 scale-[1.01]'
              : 'border-stone-300 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/40'
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragOver ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
            <Upload size={26} />
          </div>
          <p className="text-sm font-bold text-stone-800 tracking-tight">
            {isDragOver ? 'Drop to upload' : 'Drag image here or click to browse'}
          </p>
          <p className="text-xs text-stone-400 mt-1 font-medium uppercase tracking-widest">
            JPG · PNG · WEBP · Max 5MB
          </p>
        </div>
      )}

      {/* ADJUST FRAME — shown after image is picked, before upload */}
      {preview && isAdjusting && (
        <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-900">
          {/* Image frame */}
          <div
            ref={frameRef}
            className="relative h-56 overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={preview}
              alt="Adjust"
              draggable={false}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${posX}% ${posY}%`,
                transform: `scale(${zoom})`,
                transformOrigin: `${posX}% ${posY}%`,
                transition: isDraggingImage.current ? 'none' : 'transform 0.1s ease',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
            {/* Drag hint overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                <Move size={12} />
                Drag to reposition
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 bg-stone-800 flex items-center gap-3">
            {/* Zoom */}
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(1, +(z - 0.1).toFixed(1)))}
              className="p-1.5 text-stone-400 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range" min={1} max={3} step={0.05}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 accent-amber-500 h-1"
            />
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(1)))}
              className="p-1.5 text-stone-400 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={resetPosition}
              className="p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
              title="Reset position"
            >
              <RotateCcw size={15} />
            </button>

            {/* Confirm upload */}
            <button
              type="button"
              onClick={uploadToFirebase}
              disabled={isUploading}
              className="ml-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              {isUploading ? <><Loader2 size={13} className="animate-spin" /> {progress}%</> : 'Upload'}
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={removeImage}
              className="p-1.5 text-stone-400 hover:text-red-400 transition-colors"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Upload progress bar */}
          {isUploading && (
            <div className="h-1 bg-stone-700">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* PREVIEW — shown after successful upload */}
      {preview && !isAdjusting && (
        <div className="relative group h-48 rounded-xl overflow-hidden border border-stone-200">
          <img
            src={preview}
            alt="Uploaded"
            className="w-full h-full object-cover"
            style={{ objectPosition: `${posX}% ${posY}%` }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => { setIsAdjusting(true); setPendingFile(null); }}
              className="p-2 bg-white rounded-full text-stone-900 hover:bg-amber-500 hover:text-white transition-colors"
              title="Adjust position"
            >
              <Move size={18} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white rounded-full text-stone-900 hover:bg-amber-500 hover:text-white transition-colors"
              title="Replace image"
            >
              <Upload size={18} />
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="p-2 bg-white rounded-full text-stone-900 hover:bg-red-500 hover:text-white transition-colors"
              title="Remove image"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
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