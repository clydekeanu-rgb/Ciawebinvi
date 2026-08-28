import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Heart, Sparkles, X, Image as ImageIcon, CheckCircle, MessageSquare } from 'lucide-react';
import { GuestPhoto } from '../types';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioSynth';
import { fetchGuestPhotosFromGoogleSheet, postGuestPhotoToGoogleSheet } from '../services/googleSheets';

interface GuestPhotoSectionProps {
  celebrantName: string;
  onUploadPhoto?: (photo: GuestPhoto) => void;
}

export const GuestPhotoSection: React.FC<GuestPhotoSectionProps> = ({ celebrantName, onUploadPhoto }) => {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);

  const [uploaderName, setUploaderName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch photos live from Google Sheet online database & poll every 10s
  const loadOnlinePhotos = () => {
    fetchGuestPhotosFromGoogleSheet().then((remotePhotos) => {
      if (remotePhotos && Array.isArray(remotePhotos)) {
        setPhotos(remotePhotos);
      }
    });
  };

  useEffect(() => {
    loadOnlinePhotos();
    const interval = setInterval(loadOnlinePhotos, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCompressAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploaderName.trim() || !selectedFile) return;

    setIsUploading(true);

    // Read and compress image via HTML5 Canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);

          const newPhoto: GuestPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            uploaderName: uploaderName.trim(),
            caption: caption.trim() || undefined,
            imageUrl: compressedBase64,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            likes: 1,
          };

          setPhotos((prev) => [newPhoto, ...prev]);
          if (onUploadPhoto) onUploadPhoto(newPhoto);

          // Sync with Google Sheets backend
          postGuestPhotoToGoogleSheet(newPhoto).catch((err) => console.warn('Google Sheets photo post error:', err));

          // Trigger Sparkle Sound & Confetti
          audioEngine.playSparkleSound();
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FF69B4', '#C084FC', '#38BDF8', '#FBBF24']
          });

          // Reset form
          setUploaderName('');
          setCaption('');
          setSelectedFile(null);
          setPreviewUrl(null);
          setIsUploading(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3500);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleLikePhoto = (photoId: string) => {
    audioEngine.playPopSound();
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  // Split photos into 2 rows for dual marquee
  const row1Photos = photos.filter((_, i) => i % 2 === 0);
  const row2Photos = photos.filter((_, i) => i % 2 === 1);

  // Duplicate list if small so marquee loops seamlessly
  const duplicatePhotos = (list: GuestPhoto[]) => {
    if (list.length === 0) return [];
    let items = [...list];
    while (items.length < 6) {
      items = [...items, ...list];
    }
    return items;
  };

  const renderPhotoCard = (photo: GuestPhoto, key: string | number) => (
    <div
      key={`${photo.id}-${key}`}
      onClick={() => {
        const foundIdx = photos.findIndex((p) => p.id === photo.id);
        if (foundIdx !== -1) setActiveLightboxIndex(foundIdx);
      }}
      className="relative w-40 sm:w-48 h-48 rounded-2xl overflow-hidden border-2 border-pink-200 bg-white shadow-md hover:shadow-xl hover:scale-103 transition-all cursor-pointer shrink-0 flex flex-col justify-between"
    >
      <div className="relative w-full h-36 overflow-hidden bg-slate-100">
        <img
          src={photo.imageUrl}
          alt={photo.caption || `Photo by ${photo.uploaderName}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
          {photo.uploaderName}
        </div>
      </div>
      <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-pink-100 h-12">
        <p className="text-[10px] font-medium text-slate-700 truncate max-w-[100px]">
          {photo.caption || photo.createdAt}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLikePhoto(photo.id);
          }}
          className="flex items-center gap-0.5 text-[10px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 px-1.5 py-0.5 rounded-lg border border-pink-200 cursor-pointer"
        >
          <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
          <span>{photo.likes}</span>
        </button>
      </div>
    </div>
  );

  return (
    <section id="guest-photos-section" className="px-4 py-3 max-w-md lg:max-w-none mx-auto">
      <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-pink-200 relative overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-xs shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
                Guest Photo Gallery 📸
              </h2>
              <p className="text-[11px] text-pink-600 font-semibold">Share snapshots taken on the day!</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
            {photos.length} Shared
          </span>
        </div>

        {/* Upload Form Box */}
        <form onSubmit={handleCompressAndUpload} className="bg-gradient-to-br from-pink-50/80 via-purple-50/50 to-indigo-50/80 p-4 rounded-2xl border border-pink-100 mb-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Upload a photo of {celebrantName} or party moments:</span>
          </div>

          {/* Photo Dropzone / File Selector */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 bg-white/80 hover:bg-white ${
              previewUrl ? 'border-pink-400 bg-pink-50/30' : 'border-pink-200 hover:border-pink-300'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full aspect-video max-h-48 rounded-xl overflow-hidden shadow-sm">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full text-xs hover:bg-slate-900">
                  <X className="w-4 h-4" onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedFile(null); }} />
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-pink-600">Tap to Choose Photo from Phone</p>
                  <p className="text-[10px] text-slate-400">Supports JPG, PNG, WEBP</p>
                </div>
              </>
            )}
          </div>

          {/* Uploader Name & Optional Caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Tita Sarah & Chloe"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-pink-200 bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Caption / Memory Note
              </label>
              <input
                type="text"
                placeholder="e.g., Happy 3rd Birthday Celestine!"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-pink-200 bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedFile || !uploaderName.trim() || isUploading}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedFile && uploaderName.trim() && !isUploading
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <span>Compressing &amp; Sharing...</span>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Share Photo to Party Feed 💖</span>
              </>
            )}
          </button>

          {uploadSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Photo added to Celestine&apos;s Party Gallery!</span>
            </div>
          )}
        </form>

        {/* Guest Photo Infinite Marquee */}
        {photos.length === 0 ? (
          <div className="text-center py-8 px-4 bg-pink-50/50 rounded-2xl border border-dashed border-pink-200">
            <ImageIcon className="w-8 h-8 text-pink-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No guest photos shared yet!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Be the first to upload a snapshot of Celestine!</p>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden space-y-3 pt-2">
            {/* Row 1: Scrolling Left */}
            <div className="flex gap-3 overflow-hidden group">
              <div className="flex gap-3 animate-marquee group-hover:[animation-play-state:paused] shrink-0">
                {duplicatePhotos(row1Photos.length > 0 ? row1Photos : photos).map((photo, index) => renderPhotoCard(photo, index))}
              </div>
              <div className="flex gap-3 animate-marquee group-hover:[animation-play-state:paused] shrink-0" aria-hidden="true">
                {duplicatePhotos(row1Photos.length > 0 ? row1Photos : photos).map((photo, index) => renderPhotoCard(photo, index + '-dup'))}
              </div>
            </div>

            {/* Row 2: Scrolling Right (if photos >= 2) */}
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-hidden group">
                <div className="flex gap-3 animate-marquee-reverse group-hover:[animation-play-state:paused] shrink-0">
                  {duplicatePhotos(row2Photos.length > 0 ? row2Photos : photos).map((photo, index) => renderPhotoCard(photo, index))}
                </div>
                <div className="flex gap-3 animate-marquee-reverse group-hover:[animation-play-state:paused] shrink-0" aria-hidden="true">
                  {duplicatePhotos(row2Photos.length > 0 ? row2Photos : photos).map((photo, index) => renderPhotoCard(photo, index + '-dup'))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && photos[activeLightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveLightboxIndex(null)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-200">
            <button
              onClick={() => setActiveLightboxIndex(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={photos[activeLightboxIndex].imageUrl}
              alt={photos[activeLightboxIndex].caption || 'Guest photo'}
              className="w-full h-auto max-h-[75vh] object-contain bg-slate-900"
            />
            <div className="p-4 bg-white flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Shared by {photos[activeLightboxIndex].uploaderName}
                </p>
                {photos[activeLightboxIndex].caption && (
                  <p className="text-xs text-slate-600 mt-0.5">{photos[activeLightboxIndex].caption}</p>
                )}
              </div>
              <button
                onClick={() => handleLikePhoto(photos[activeLightboxIndex].id)}
                className="flex items-center gap-1.5 text-xs font-bold text-pink-600 bg-pink-100 px-3 py-1.5 rounded-xl border border-pink-200 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span>{photos[activeLightboxIndex].likes} Likes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
