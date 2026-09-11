import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Heart,
  Sparkles,
  X,
  Image as ImageIcon,
  CheckCircle,
  MessageSquare,
  Send,
  Share2,
  Filter,
  Maximize2
} from 'lucide-react';
import { GuestPhoto, GuestPhotoComment } from '../types';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioSynth';
import {
  fetchGuestPhotosFromGoogleSheet,
  postGuestPhotoToGoogleSheet,
  fetchPhotoCommentsFromGoogleSheet,
  postPhotoCommentToGoogleSheet
} from '../services/googleSheets';

interface GuestPhotoSectionProps {
  celebrantName: string;
  onUploadPhoto?: (photo: GuestPhoto) => void;
}

interface PhotoMetaItem {
  reactions: Record<string, number>;
  comments: GuestPhotoComment[];
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

  // Facebook Feed Modal State
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [feedSortBy, setFeedSortBy] = useState<'latest' | 'popular'>('latest');

  // Photo Reactions & Comments Metadata (LocalStorage synced)
  const [photoMeta, setPhotoMeta] = useState<Record<string, PhotoMetaItem>>(() => {
    try {
      const saved = localStorage.getItem('gabby_party_guest_photo_meta');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [commenterName, setCommenterName] = useState(() => {
    return localStorage.getItem('gabby_party_commenter_name') || '';
  });
  const [activeCommentInputs, setActiveCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync photo metadata to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gabby_party_guest_photo_meta', JSON.stringify(photoMeta));
    } catch (e) {
      console.warn('Could not save photo meta to localStorage:', e);
    }
  }, [photoMeta]);

  // Sync commenter name to localStorage
  useEffect(() => {
    if (commenterName) {
      localStorage.setItem('gabby_party_commenter_name', commenterName);
    }
  }, [commenterName]);

  // Fetch photos & comments live from Google Sheet online database & poll every 10s
  const loadOnlinePhotos = () => {
    fetchGuestPhotosFromGoogleSheet().then((remotePhotos) => {
      if (remotePhotos && Array.isArray(remotePhotos)) {
        setPhotos(remotePhotos);
      }
    });

    fetchPhotoCommentsFromGoogleSheet().then((remoteComments) => {
      if (remoteComments && Array.isArray(remoteComments) && remoteComments.length > 0) {
        setPhotoMeta((prev) => {
          const updated = { ...prev };
          remoteComments.forEach((rc) => {
            const existing = updated[rc.photoId] || {
              reactions: { '❤️': 1, '🎉': 0, '😍': 0, '👏': 0 },
              comments: [],
            };
            const alreadyExists = existing.comments.some((c) => c.id === rc.id);
            if (!alreadyExists) {
              existing.comments = [
                ...existing.comments,
                {
                  id: rc.id,
                  author: rc.author,
                  text: rc.text,
                  createdAt: rc.createdAt || 'Just now',
                },
              ];
            }
            updated[rc.photoId] = existing;
          });
          return updated;
        });
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

          // Initialize metadata for new photo
          setPhotoMeta((prev) => ({
            ...prev,
            [newPhoto.id]: {
              reactions: { '❤️': 1, '🎉': 0, '😍': 0, '👏': 0 },
              comments: [],
            },
          }));

          // Sync with Google Sheets backend
          postGuestPhotoToGoogleSheet(newPhoto).catch((err) => console.warn('Google Sheets photo post error:', err));

          // Trigger Sparkle Sound & Confetti
          audioEngine.playSparkleSound();
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FF69B4', '#C084FC', '#38BDF8', '#FBBF24'],
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

  const getPhotoMeta = (photo: GuestPhoto): PhotoMetaItem => {
    const existing = photoMeta[photo.id];
    if (existing) return existing;
    return {
      reactions: { '❤️': photo.likes || 1, '🎉': 0, '😍': 0, '👏': 0 },
      comments: [],
    };
  };

  const handleLikePhoto = (photoId: string) => {
    audioEngine.playPopSound();
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, likes: p.likes + 1 } : p))
    );
    setPhotoMeta((prev) => {
      const current = prev[photoId] || {
        reactions: { '❤️': 1, '🎉': 0, '😍': 0, '👏': 0 },
        comments: [],
      };
      return {
        ...prev,
        [photoId]: {
          ...current,
          reactions: {
            ...current.reactions,
            '❤️': (current.reactions['❤️'] || 0) + 1,
          },
        },
      };
    });
  };

  const handleReactToPhoto = (photoId: string, emoji: string) => {
    audioEngine.playPopSound();
    setPhotoMeta((prev) => {
      const current = prev[photoId] || {
        reactions: { '❤️': 1, '🎉': 0, '😍': 0, '👏': 0 },
        comments: [],
      };
      return {
        ...prev,
        [photoId]: {
          ...current,
          reactions: {
            ...current.reactions,
            [emoji]: (current.reactions[emoji] || 0) + 1,
          },
        },
      };
    });

    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleAddComment = (photoId: string) => {
    const text = (activeCommentInputs[photoId] || '').trim();
    const author = commenterName.trim() || 'Party Guest';
    if (!text) return;

    const newComment: GuestPhotoComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      author,
      text,
      createdAt: 'Just now',
    };

    setPhotoMeta((prev) => {
      const current = prev[photoId] || {
        reactions: { '❤️': 1, '🎉': 0, '😍': 0, '👏': 0 },
        comments: [],
      };
      return {
        ...prev,
        [photoId]: {
          ...current,
          comments: [...current.comments, newComment],
        },
      };
    });

    // Sync comment to Google Sheets backend
    postPhotoCommentToGoogleSheet(photoId, newComment).catch((err) =>
      console.warn('Google Sheets photo comment post error:', err)
    );

    setActiveCommentInputs((prev) => ({ ...prev, [photoId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [photoId]: true }));
    audioEngine.playSparkleSound();
  };

  const handleSharePhoto = (photo: GuestPhoto) => {
    if (navigator.share) {
      navigator.share({
        title: `${celebrantName}'s Birthday Party Photo`,
        text: `Check out this photo from ${celebrantName}'s Birthday Pool Party shared by ${photo.uploaderName}! 📸✨`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Photo link copied to clipboard! 📋✨');
    }
  };

  const getAvatarInitials = (name: string) => {
    if (!name) return '🐱';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-teal-400 to-emerald-500',
      'from-amber-400 to-orange-500',
      'from-sky-400 to-blue-600',
      'from-fuchsia-500 to-pink-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
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

  const sortedPhotosForFeed = [...photos].sort((a, b) => {
    if (feedSortBy === 'popular') {
      const metaA = getPhotoMeta(a);
      const metaB = getPhotoMeta(b);
      const totalA = Object.values(metaA.reactions).reduce((sum, v) => sum + v, 0);
      const totalB = Object.values(metaB.reactions).reduce((sum, v) => sum + v, 0);
      return totalB - totalA;
    }
    return 0; // Default is newest first as fetched
  });

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

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFeedModalOpen(true)}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Open Facebook-style guest photo feed"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span>View Feed ({photos.length})</span>
            </button>
          </div>
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

        {/* Marquee Card Footer */}
        <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Live guest photo stream
          </span>
          <button
            onClick={() => setIsFeedModalOpen(true)}
            className="text-[11px] font-bold text-purple-600 hover:text-purple-700 underline cursor-pointer flex items-center gap-1"
          >
            <span>Open Facebook-style Feed</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Facebook-Style Guest Photos Feed Modal */}
      {isFeedModalOpen && (
        <div
          onClick={() => setIsFeedModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
        >
          {/* Feed Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-pink-200 px-4 py-3 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xs">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-heading text-slate-800 flex items-center gap-1.5">
                  <span>Guest Moments Feed 📸</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-sans font-semibold">
                    {photos.length} Posts
                  </span>
                </h3>
                <p className="text-[11px] text-purple-600 font-medium">
                  Reactions &amp; memories from Celestine&apos;s special day
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Filter Toggle */}
              <button
                onClick={() => setFeedSortBy(feedSortBy === 'latest' ? 'popular' : 'latest')}
                className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                title="Toggle Feed Sort Order"
              >
                <Filter className="w-3 h-3 text-purple-500" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="font-bold text-purple-700">
                  {feedSortBy === 'latest' ? 'Latest' : 'Most Loved'}
                </span>
              </button>

              <button
                onClick={() => setIsFeedModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Feed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feed Scrollable Body */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-3 sm:p-5"
          >
            <div className="max-w-lg mx-auto space-y-4 pb-16">
              {/* Top Banner prompting upload */}
              <div
                onClick={() => {
                  setIsFeedModalOpen(false);
                  const el = document.getElementById('guest-photos-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-3 px-4 shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Have a photo of Celestine?</p>
                    <p className="text-[10px] text-pink-100">Tap here to share it to this feed!</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-white text-purple-700 px-3 py-1 rounded-full shadow-xs">
                  Upload Photo 📸
                </span>
              </div>

              {/* Feed Posts */}
              {sortedPhotosForFeed.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-pink-100 shadow-md">
                  <ImageIcon className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800">No photos shared in the feed yet!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Be the very first guest to share a special snapshot!
                  </p>
                </div>
              ) : (
                sortedPhotosForFeed.map((photo) => {
                  const meta = getPhotoMeta(photo);
                  const totalReactions = Object.values(meta.reactions).reduce((acc, v) => acc + v, 0);
                  const isCommentsOpen = expandedComments[photo.id] || false;
                  const commentInputVal = activeCommentInputs[photo.id] || '';

                  return (
                    <article
                      key={`feed-${photo.id}`}
                      className="bg-white rounded-3xl border border-pink-100/80 shadow-md overflow-hidden transition-all hover:shadow-lg"
                    >
                      {/* Post Header: Avatar, Name, Timestamp */}
                      <div className="p-3.5 pb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarColor(
                              photo.uploaderName
                            )} flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0`}
                          >
                            {getAvatarInitials(photo.uploaderName)}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                              {photo.uploaderName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                              <span>{photo.createdAt || 'Party Moment'}</span>
                              <span>•</span>
                              <span className="text-pink-600 font-semibold flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Party Guest
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSharePhoto(photo)}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                          title="Share post"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Post Caption (if available) */}
                      {photo.caption && (
                        <div className="px-4 pb-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                          {photo.caption}
                        </div>
                      )}

                      {/* Post Media: Full-Width Photo with Tap to Expand */}
                      <div
                        onClick={() => {
                          const idx = photos.findIndex((p) => p.id === photo.id);
                          if (idx !== -1) setActiveLightboxIndex(idx);
                        }}
                        className="relative w-full aspect-4/3 sm:aspect-16/10 bg-slate-950 overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption || `Photo by ${photo.uploaderName}`}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-xs text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Reactions & Comments Summary Counters Bar */}
                      <div className="px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 border-b border-pink-50">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center -space-x-1">
                            {meta.reactions['❤️'] > 0 && (
                              <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-xs shadow-xs">
                                ❤️
                              </span>
                            )}
                            {meta.reactions['🎉'] > 0 && (
                              <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs shadow-xs">
                                🎉
                              </span>
                            )}
                            {meta.reactions['😍'] > 0 && (
                              <span className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center text-xs shadow-xs">
                                😍
                              </span>
                            )}
                            {meta.reactions['👏'] > 0 && (
                              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs shadow-xs">
                                👏
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-slate-700 ml-1">
                            {totalReactions > 0 ? totalReactions : photo.likes}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [photo.id]: !prev[photo.id],
                            }))
                          }
                          className="hover:underline cursor-pointer"
                        >
                          {meta.comments.length}{' '}
                          {meta.comments.length === 1 ? 'comment' : 'comments'}
                        </button>
                      </div>

                      {/* Facebook Action Bar: Emoji Reactions & Comment Buttons */}
                      <div className="px-2 py-1.5 grid grid-cols-5 gap-1 text-center bg-slate-50/50">
                        {/* Reaction: ❤️ Love */}
                        <button
                          onClick={() => handleReactToPhoto(photo.id, '❤️')}
                          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 px-1 rounded-xl hover:bg-pink-100/70 text-slate-700 transition-colors cursor-pointer active:scale-95"
                        >
                          <span className="text-base">❤️</span>
                          <span className="text-[10px] sm:text-xs font-semibold">
                            {meta.reactions['❤️'] || 0}
                          </span>
                        </button>

                        {/* Reaction: 🎉 Party */}
                        <button
                          onClick={() => handleReactToPhoto(photo.id, '🎉')}
                          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 px-1 rounded-xl hover:bg-amber-100/70 text-slate-700 transition-colors cursor-pointer active:scale-95"
                        >
                          <span className="text-base">🎉</span>
                          <span className="text-[10px] sm:text-xs font-semibold">
                            {meta.reactions['🎉'] || 0}
                          </span>
                        </button>

                        {/* Reaction: 😍 Cute */}
                        <button
                          onClick={() => handleReactToPhoto(photo.id, '😍')}
                          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 px-1 rounded-xl hover:bg-purple-100/70 text-slate-700 transition-colors cursor-pointer active:scale-95"
                        >
                          <span className="text-base">😍</span>
                          <span className="text-[10px] sm:text-xs font-semibold">
                            {meta.reactions['😍'] || 0}
                          </span>
                        </button>

                        {/* Reaction: 👏 Bravo */}
                        <button
                          onClick={() => handleReactToPhoto(photo.id, '👏')}
                          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 px-1 rounded-xl hover:bg-emerald-100/70 text-slate-700 transition-colors cursor-pointer active:scale-95"
                        >
                          <span className="text-base">👏</span>
                          <span className="text-[10px] sm:text-xs font-semibold">
                            {meta.reactions['👏'] || 0}
                          </span>
                        </button>

                        {/* Toggle Comment Box */}
                        <button
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [photo.id]: !prev[photo.id],
                            }))
                          }
                          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 px-1 rounded-xl hover:bg-blue-100/70 text-slate-700 transition-colors cursor-pointer active:scale-95"
                        >
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span className="text-[10px] sm:text-xs font-semibold">
                            {meta.comments.length}
                          </span>
                        </button>
                      </div>

                      {/* Comments Thread & Inline Composer */}
                      <div className="p-3 sm:p-4 bg-slate-50/70 border-t border-pink-100/70 space-y-3">
                        {/* Existing comments */}
                        {meta.comments.length > 0 && (
                          <div className="space-y-2">
                            {meta.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start gap-2 text-xs"
                              >
                                <div
                                  className={`w-7 h-7 rounded-full bg-gradient-to-tr ${getAvatarColor(
                                    comment.author
                                  )} flex items-center justify-center text-white font-bold text-[10px] shrink-0`}
                                >
                                  {getAvatarInitials(comment.author)}
                                </div>
                                <div className="bg-white rounded-2xl p-2.5 px-3 border border-pink-100 shadow-2xs max-w-[85%]">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-[11px] text-slate-800">
                                      {comment.author}
                                    </span>
                                    <span className="text-[9px] text-slate-400">
                                      {comment.createdAt}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 mt-0.5 text-xs leading-relaxed">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input Composer */}
                        <div className="space-y-2 pt-1">
                          {/* Name indicator/input */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-medium">
                              Posting as:
                            </span>
                            <input
                              type="text"
                              placeholder="Your name"
                              value={commenterName}
                              onChange={(e) => setCommenterName(e.target.value)}
                              className="text-xs bg-white border border-pink-200 rounded-lg px-2 py-0.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-pink-400 max-w-[140px]"
                            />
                          </div>

                          {/* Comment Text Input & Send */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Write a sweet comment..."
                              value={commentInputVal}
                              onChange={(e) =>
                                setActiveCommentInputs((prev) => ({
                                  ...prev,
                                  [photo.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddComment(photo.id);
                                }
                              }}
                              className="flex-1 bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                            />
                            <button
                              onClick={() => handleAddComment(photo.id)}
                              disabled={!commentInputVal.trim()}
                              className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                                commentInputVal.trim()
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                              title="Send comment"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full-Screen Viewing */}
      {activeLightboxIndex !== null && photos[activeLightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
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
                  <p className="text-xs text-slate-600 mt-0.5">
                    {photos[activeLightboxIndex].caption}
                  </p>
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

