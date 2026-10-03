import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, ArrowLeft, X, RefreshCw, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioSynth';
import { postGuestPhotoToGoogleSheet } from '../services/googleSheets';
import { navigateTo } from '../utils/router';
import { GuestPhoto } from '../types';

interface QuickUploadPageProps {
  celebrantName?: string;
  onPhotoUploaded?: (photo: GuestPhoto) => void;
}

export const QuickUploadPage: React.FC<QuickUploadPageProps> = ({
  celebrantName = 'Celestine',
  onPhotoUploaded,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploaderName, setUploaderName] = useState(() => {
    try {
      return localStorage.getItem('gabby_party_uploader_name') || '';
    } catch {
      return '';
    }
  });
  const [caption, setCaption] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount or when files change
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles(newFiles);

    // Generate previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    if (updatedFiles.length === 0) {
      setUploadStatus('idle');
    }
  };

  /**
   * Compress image in browser: max dimension 1600px, JPEG quality 0.8
   */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1600;
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !uploaderName.trim()) return;

    // Save uploader name in localStorage for repeat visits
    try {
      localStorage.setItem('gabby_party_uploader_name', uploaderName.trim());
    } catch (err) {
      console.warn('Could not save uploader name to localStorage:', err);
    }

    setUploadStatus('uploading');
    setUploadProgress({ current: 0, total: selectedFiles.length });
    setErrorMessage('');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress({ current: i + 1, total: selectedFiles.length });
        const file = selectedFiles[i];

        // Compress in browser
        const compressedBase64 = await compressImage(file);

        const newPhoto: GuestPhoto = {
          id: `guest-photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          uploaderName: uploaderName.trim(),
          caption: caption.trim() || undefined,
          imageUrl: compressedBase64,
          createdAt: 'Just now',
          likes: 1,
          reactions: { '❤️': 1, '🎉': 0, '😍': 0, '👏': 0 },
          comments: [],
        };

        // Notify parent if listener exists
        if (onPhotoUploaded) {
          onPhotoUploaded(newPhoto);
        }

        // Post to Google Apps Script (Drive folder + Sheets row)
        await postGuestPhotoToGoogleSheet(newPhoto);
      }

      // Celebrate success!
      audioEngine.playSparkleSound();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#00FFFF', '#FFD700', '#9370DB'],
      });

      setUploadStatus('success');
    } catch (err) {
      console.error('Error during quick upload:', err);
      setErrorMessage('Could not upload photo. Please check your connection and try again.');
      setUploadStatus('error');
    }
  };

  const handleResetForAnother = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setCaption('');
    setUploadStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F6] via-[#F8F0FC] to-[#E6FFFA] text-slate-800 relative flex flex-col justify-between p-4 sm:p-6">
      {/* Background Dollhouse dots */}
      <div className="fixed inset-0 dollhouse-dots opacity-30 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-md mx-auto w-full pt-4 pb-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>{celebrantName.toUpperCase()}&apos;S 3RD BIRTHDAY POOL PARTY</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 leading-tight">
          Share Your Photos! 📸
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
          Snap a live memory or pick favorites from your phone to share with {celebrantName} &amp; family!
        </p>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto py-4">
        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        {/* STATE 1: INITIAL TWO BUTTONS */}
        {selectedFiles.length === 0 && uploadStatus === 'idle' && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-pink-200 space-y-4">
            {/* Button 1: Take a Photo (Camera Direct) */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-98 text-white font-black text-lg sm:text-xl shadow-lg shadow-pink-200 flex items-center justify-center gap-3 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Take a Photo</div>
                <div className="text-[11px] font-semibold text-pink-100 opacity-90">Opens your camera</div>
              </div>
            </button>

            {/* Button 2: Upload from Gallery (Multi-select) */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full py-5 px-6 rounded-2xl bg-white hover:bg-purple-50/50 active:scale-98 text-slate-800 font-extrabold text-base sm:text-lg border-2 border-purple-200 hover:border-purple-300 shadow-md shadow-purple-100 flex items-center justify-center gap-3 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform text-purple-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="leading-tight text-slate-900">Upload from Gallery</div>
                <div className="text-[11px] font-medium text-slate-500">Pick one or multiple photos</div>
              </div>
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-400">
                Photos are automatically saved to {celebrantName}&apos;s party keepsake album 💕
              </p>
            </div>
          </div>
        )}

        {/* STATE 2: PREVIEW & DETAILS FORM */}
        {selectedFiles.length > 0 && uploadStatus !== 'success' && (
          <form
            onSubmit={handleSubmitUpload}
            className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-xl border-2 border-pink-200 space-y-4"
          >
            {/* Image Preview Header */}
            <div className="flex items-center justify-between pb-1 border-b border-pink-100">
              <span className="text-xs font-bold text-slate-800">
                {selectedFiles.length === 1 ? 'Photo Preview' : `${selectedFiles.length} Photos Selected`}
              </span>
              <button
                type="button"
                disabled={uploadStatus === 'uploading'}
                onClick={handleResetForAnother}
                className="text-[11px] font-semibold text-pink-600 hover:text-pink-700 underline cursor-pointer disabled:opacity-50"
              >
                Choose Different
              </button>
            </div>

            {/* Thumbnail Preview(s) */}
            {previews.length === 1 ? (
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                <img
                  src={previews[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-pink-100">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 shadow-2xs group">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    {uploadStatus !== 'uploading' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tita Sarah &amp; Chloe"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  disabled={uploadStatus === 'uploading'}
                  required
                  className="w-full bg-slate-50 focus:bg-white border border-pink-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-400 transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Caption or Sweet Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Splashing with Cia! Happy 3rd Birthday! 🐱💖"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={uploadStatus === 'uploading'}
                  className="w-full bg-slate-50 focus:bg-white border border-pink-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-400 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Error Message with Retry */}
            {uploadStatus === 'error' && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-[11px]">Upload Failed</p>
                  <p className="text-[10px] text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Submit / Uploading Button */}
            <button
              type="submit"
              disabled={uploadStatus === 'uploading' || !uploaderName.trim()}
              className={`w-full py-3 px-4 rounded-xl text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                uploadStatus === 'uploading' || !uploaderName.trim()
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-pink-200 hover:shadow-lg active:scale-98'
              }`}
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Uploading {uploadProgress.current} of {uploadProgress.total}...
                  </span>
                </>
              ) : uploadStatus === 'error' ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Upload Again</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>
                    {selectedFiles.length === 1 ? 'Post Photo to Wall 🚀' : `Post ${selectedFiles.length} Photos 🚀`}
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STATE 3: SUCCESS CONFIRMATION */}
        {uploadStatus === 'success' && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-emerald-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black font-heading text-slate-900 leading-tight">
                Thanks! Your photo is on the wall! 🎉
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Thank you for contributing to {celebrantName}&apos;s 3rd birthday memories!
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-sm shadow-md shadow-pink-200 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Add Another Photo 📸</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>See the Photo Wall 💖</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Back Link */}
      <footer className="relative z-10 max-w-md mx-auto w-full pt-3 pb-2 text-center">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-purple-600 underline transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {celebrantName}&apos;s Party Invitation</span>
        </a>
      </footer>
    </div>
  );
};
