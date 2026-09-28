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
  MessageCircleHeart,
  Send,
  Share2,
  Filter,
  Maximize2,
  LayoutGrid,
  List
} from 'lucide-react';
import { GuestPhoto, GuestPhotoComment, BirthdayWish } from '../types';
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
  defaultView?: 'feed' | 'marquee';
  /** When provided, wishes are interleaved in the feed as Facebook-wall-style posts */
  wishes?: BirthdayWish[];
  onAddWish?: (wish: BirthdayWish) => void;
  onLikeWish?: (wishId: string) => void;
}

interface PhotoMetaItem {
  reactions: Record<string, number>;
  comments: GuestPhotoComment[];
}

export const GuestPhotoSection: React.FC<GuestPhotoSectionProps> = ({
  celebrantName,
  onUploadPhoto,
  defaultView = 'feed',
  wishes,
  onAddWish,
  onLikeWish
}) => {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);

  const [uploaderName, setUploaderName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Facebook Feed View State - DEFAULT TO 'feed'
  const [viewMode, setViewMode] = useState<'feed' | 'marquee'>(defaultView);
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
            const commentItem: GuestPhotoComment = {
              id: rc.id,
              author: rc.author,
              text: rc.text,
              createdAt: rc.createdAt,
            };
            const commentExists = existing.comments.some(
              (c) => c.id === rc.id || (c.author === rc.author && c.text === rc.text)
            );
            if (!commentExists) {
              existing.comments.push(commentItem);
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

  const getPhotoMeta = (photo: GuestPhoto): PhotoMetaItem => {
    return (
      photoMeta[photo.id] || {
        reactions: {
          '❤️': photo.likes || 1,
          '🎉': photo.reactions?.['🎉'] || 0,
          '😍': photo.reactions?.['😍'] || 0,
          '👏': photo.reactions?.['👏'] || 0,
        },
        comments: photo.comments || [],
      }
    );
  };

  const handleLikePhoto = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );
    handleReactToPhoto(photoId, '❤️');
  };

  const handleReactToPhoto = (photoId: string, emoji: string) => {
    audioEngine.playSparkleSound();
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#FF69B4', '#C084FC', '#38BDF8', '#FBBF24'],
    });

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
  };

  const handleAddComment = (photoId: string) => {
    const text = activeCommentInputs[photoId]?.trim();
    if (!text) return;

    const author = commenterName.trim() || 'Party Guest';
    const newComment: GuestPhotoComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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

    postPhotoCommentToGoogleSheet(photoId, newComment);
    audioEngine.playSparkleSound();

    setActiveCommentInputs((prev) => ({
      ...prev,
      [photoId]: '',
    }));
  };

  const handleSharePhoto = (photo: GuestPhoto) => {
    if (navigator.share) {
      navigator
        .share({
          title: `${celebrantName}'s 3rd Birthday Moment`,
          text: photo.caption
            ? `"${photo.caption}" — shared by ${photo.uploaderName}`
            : `Shared by ${photo.uploaderName} at ${celebrantName}'s Birthday Party!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new window.Image();
        img.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            reject(new Error('Canvas context not available'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        if (readerEvent.target?.result) {
          img.src = readerEvent.target.result as string;
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleCompressAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploaderName.trim()) return;

    setIsUploading(true);

    try {
      const compressedDataUrl = await compressImage(selectedFile);

      const newPhoto: GuestPhoto = {
        id: `guest-photo-${Date.now()}`,
        uploaderName: uploaderName.trim(),
        caption: caption.trim() || undefined,
        imageUrl: compressedDataUrl,
        createdAt: 'Just now',
        likes: 1,
        reactions: { '❤️': 1, '🎉': 0, '😍': 0, '👏': 0 },
        comments: [],
      };

      setPhotos((prev) => [newPhoto, ...prev]);

      setPhotoMeta((prev) => ({
        ...prev,
        [newPhoto.id]: {
          reactions: { '❤️': 1, '🎉': 0, '😍': 0, '👏': 0 },
          comments: [],
        },
      }));

      if (onUploadPhoto) {
        onUploadPhoto(newPhoto);
      }

      postGuestPhotoToGoogleSheet(newPhoto);

      // Trigger Confetti Celebration
      audioEngine.playSparkleSound();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#00FFFF', '#FFD700', '#9370DB'],
      });

      setUploaderName('');
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (error) {
      console.error('Error compressing and uploading photo:', error);
      alert('Could not upload image. Please try a smaller photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-400 to-rose-500',
      'from-purple-400 to-indigo-500',
      'from-cyan-400 to-blue-500',
      'from-amber-400 to-orange-500',
      'from-emerald-400 to-teal-500',
      'from-fuchsia-400 to-pink-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const row1Photos = photos.filter((_, i) => i % 2 === 0);
  const row2Photos = photos.filter((_, i) => i % 2 !== 0);

  const duplicatePhotos = (arr: GuestPhoto[]) => {
    if (arr.length === 0) return [];
    let items = [...arr];
    while (items.length < 8) {
      items = [...items, ...arr];
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
    return 0; // Default is newest first
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

  // Render a Single Facebook-Style Post Card
  const renderFeedPost = (photo: GuestPhoto) => {
    const meta = getPhotoMeta(photo);
    const totalReactions = Object.values(meta.reactions).reduce((acc, v) => acc + v, 0);
    const isCommentsOpen = expandedComments[photo.id] ?? true; // Open comments by default for friendly engagement
    const commentInputVal = activeCommentInputs[photo.id] || '';

    return (
      <article
        key={`feed-${photo.id}`}
        className="bg-white rounded-3xl border border-pink-200/80 shadow-md overflow-hidden transition-all hover:shadow-lg mb-4"
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
        <div className="px-2 py-1.5 grid grid-cols-5 gap-1 text-center bg-slate-50/60 border-b border-pink-50">
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
        <div className="p-3 sm:p-4 bg-slate-50/70 space-y-3">
          {/* Existing comments */}
          {meta.comments.length > 0 && isCommentsOpen && (
            <div className="space-y-2">
              {meta.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 text-xs">
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
                      <span className="text-[9px] text-slate-400">{comment.createdAt}</span>
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-medium">Posting as:</span>
              <input
                type="text"
                placeholder="Your name"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                className="text-xs bg-white border border-pink-200 rounded-lg px-2 py-0.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-pink-400 max-w-[140px]"
              />
            </div>

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
  };

  // Render a Birthday Wish as a Facebook-Wall-Style Post
  const renderWishPost = (wish: BirthdayWish) => {
    return (
      <article
        key={`wish-post-${wish.id}`}
        className="bg-white rounded-3xl border border-fuchsia-200/80 shadow-md overflow-hidden transition-all hover:shadow-lg mb-4"
      >
        {/* Wish Post Header */}
        <div className="p-3.5 pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarColor(
                wish.sender
              )} flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0`}
            >
              {getAvatarInitials(wish.sender)}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {wish.sender}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                <span>{wish.timestamp || 'Birthday Note'}</span>
                <span>•</span>
                <span className="text-fuchsia-600 font-semibold flex items-center gap-0.5">
                  <MessageCircleHeart className="w-2.5 h-2.5" /> Birthday Wish
                </span>
              </div>
            </div>
          </div>
          <span className="text-2xl">{wish.sticker}</span>
        </div>

        {/* Wish Message Body */}
        <div className="px-4 pb-3 text-sm sm:text-base text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
          {wish.message}
        </div>

        {/* Wish Gradient Accent Bar */}
        <div className="mx-4 mb-3 h-1 rounded-full bg-gradient-to-r from-pink-300 via-fuchsia-300 to-purple-300 opacity-60" />

        {/* Like Action */}
        <div className="px-4 py-2.5 flex items-center justify-between border-t border-fuchsia-50 bg-fuchsia-50/30">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-xs">❤️</span>
            <span className="font-semibold text-slate-700 ml-0.5">{wish.likes}</span>
          </div>
          {onLikeWish && (
            <button
              onClick={() => onLikeWish(wish.id)}
              className="flex items-center gap-1.5 text-xs font-bold text-pink-600 bg-white hover:bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              <span>Love</span>
            </button>
          )}
        </div>
      </article>
    );
  };

  // Wish form state (only used when wishes are integrated)
  const [wishSenderName, setWishSenderName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [wishSticker, setWishSticker] = useState('💖');
  const wishStickers = ['💖', '🐱', '✨', '🧁', '👑', '🎉', '🦄', '🎈'];

  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishSenderName.trim() || !wishMessage.trim() || !onAddWish) return;

    const newWish: BirthdayWish = {
      id: `wish-${Date.now()}`,
      sender: wishSenderName.trim(),
      message: wishMessage.trim(),
      sticker: wishSticker,
      timestamp: 'Just now',
      likes: 1
    };

    onAddWish(newWish);
    setWishSenderName('');
    setWishMessage('');

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.85 }
    });
  };

  // Build interleaved feed: photos + wishes merged chronologically
  type FeedItem = { type: 'photo'; data: GuestPhoto } | { type: 'wish'; data: BirthdayWish };

  const interleavedFeed: FeedItem[] = (() => {
    const photoItems: FeedItem[] = sortedPhotosForFeed.map(p => ({ type: 'photo' as const, data: p }));

    if (!wishes || wishes.length === 0) return photoItems;

    const wishItems: FeedItem[] = wishes.map(w => ({ type: 'wish' as const, data: w }));

    // Interleave: show a wish after every 2 photos, then remaining wishes at the end
    const merged: FeedItem[] = [];
    let wishIdx = 0;
    for (let i = 0; i < photoItems.length; i++) {
      merged.push(photoItems[i]);
      // After every 2nd photo, insert a wish
      if ((i + 1) % 2 === 0 && wishIdx < wishItems.length) {
        merged.push(wishItems[wishIdx]);
        wishIdx++;
      }
    }
    // Append remaining wishes
    while (wishIdx < wishItems.length) {
      merged.push(wishItems[wishIdx]);
      wishIdx++;
    }

    return merged;
  })();

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
                Guest Photo Feed 📸
              </h2>
              <p className="text-[11px] text-pink-600 font-semibold">
                Facebook-style live party moments &amp; comments
              </p>
            </div>
          </div>

          {/* View Mode & Filter Controls */}
          <div className="flex items-center gap-1.5">
            {viewMode === 'feed' && (
              <button
                onClick={() => setFeedSortBy(feedSortBy === 'latest' ? 'popular' : 'latest')}
                className="text-[10px] sm:text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                title="Toggle Feed Sort Order"
              >
                <Filter className="w-3 h-3 text-purple-500" />
                <span className="font-bold text-purple-700">
                  {feedSortBy === 'latest' ? 'Latest' : 'Most Loved'}
                </span>
              </button>
            )}

            {/* View Mode Toggle: Feed (Default) vs Marquee */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
              <button
                onClick={() => setViewMode('feed')}
                className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'feed'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
                title="Facebook Feed View"
              >
                <List className="w-3 h-3" />
                <span>Feed</span>
              </button>
              <button
                onClick={() => setViewMode('marquee')}
                className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'marquee'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
                title="Marquee Gallery View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Marquee</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Form Box */}
        <form
          onSubmit={handleCompressAndUpload}
          className="bg-gradient-to-br from-pink-50/80 via-purple-50/50 to-indigo-50/80 p-4 rounded-2xl border border-pink-100 mb-5 space-y-3"
        >
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
                  <X
                    className="w-4 h-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(null);
                      setSelectedFile(null);
                    }}
                  />
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
                placeholder="e.g., Tita Sarah &amp; Chloe"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                required
                className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Caption or Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Happy 3rd Birthday Celestine! 🐱💖"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-400 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !selectedFile || !uploaderName.trim()}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isUploading || !selectedFile || !uploaderName.trim()
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-pink-200 hover:shadow-lg active:scale-98'
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading Photo to Feed...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Share Photo to Party Feed 🚀</span>
              </>
            )}
          </button>

          {uploadSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Photo added to {celebrantName}&apos;s Party Feed!</span>
            </div>
          )}
        </form>

        {/* Inline Wish Composer (when wishes are integrated into the feed) */}
        {wishes && onAddWish && (
          <form onSubmit={handleSubmitWish} className="bg-gradient-to-br from-fuchsia-50/80 via-purple-50/50 to-pink-50/80 p-4 rounded-2xl border border-fuchsia-100 mb-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <MessageCircleHeart className="w-3.5 h-3.5 text-fuchsia-500" />
              <span>Leave a Birthday Note for {celebrantName}:</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Your Name"
                value={wishSenderName}
                onChange={(e) => setWishSenderName(e.target.value)}
                className="w-1/2 p-2 rounded-xl border border-fuchsia-200 focus:ring-2 focus:ring-pink-400 bg-white text-xs"
                required
              />
              <div className="w-1/2 flex items-center justify-around bg-white p-1 rounded-xl border border-fuchsia-200">
                {wishStickers.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setWishSticker(s)}
                    className={`text-base p-0.5 rounded-md cursor-pointer ${wishSticker === s ? 'bg-fuchsia-100 scale-125' : 'opacity-70'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Write your wish for ${celebrantName}...`}
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-fuchsia-200 focus:ring-2 focus:ring-pink-400 bg-white text-xs"
                required
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl font-bold shadow-xs hover:from-fuchsia-600 hover:to-purple-700 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* DEFAULT VIEW: Facebook-Style Feed (with interleaved wishes when provided) */}
        {viewMode === 'feed' ? (
          <div>
            {interleavedFeed.length === 0 ? (
              <div className="text-center py-10 px-4 bg-pink-50/50 rounded-2xl border border-dashed border-pink-200">
                <ImageIcon className="w-10 h-10 text-pink-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No posts in the feed yet!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Be the first to share a photo or leave a birthday wish above!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {interleavedFeed.map((item) =>
                  item.type === 'photo'
                    ? renderFeedPost(item.data as GuestPhoto)
                    : renderWishPost(item.data as BirthdayWish)
                )}
              </div>
            )}
          </div>
        ) : (
          /* ALTERNATIVE VIEW: Marquee Carousel */
          <div>
            {photos.length === 0 ? (
              <div className="text-center py-8 px-4 bg-pink-50/50 rounded-2xl border border-dashed border-pink-200">
                <ImageIcon className="w-8 h-8 text-pink-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No guest photos shared yet!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Be the first to upload a snapshot!</p>
              </div>
            ) : (
              <div className="relative w-full overflow-hidden space-y-3 pt-2">
                <div className="flex gap-3 overflow-hidden group">
                  <div className="flex gap-3 animate-marquee group-hover:[animation-play-state:paused] shrink-0">
                    {duplicatePhotos(row1Photos.length > 0 ? row1Photos : photos).map((photo, index) =>
                      renderPhotoCard(photo, index)
                    )}
                  </div>
                  <div
                    className="flex gap-3 animate-marquee group-hover:[animation-play-state:paused] shrink-0"
                    aria-hidden="true"
                  >
                    {duplicatePhotos(row1Photos.length > 0 ? row1Photos : photos).map((photo, index) =>
                      renderPhotoCard(photo, index + '-dup')
                    )}
                  </div>
                </div>

                {photos.length > 1 && (
                  <div className="flex gap-3 overflow-hidden group">
                    <div className="flex gap-3 animate-marquee-reverse group-hover:[animation-play-state:paused] shrink-0">
                      {duplicatePhotos(row2Photos.length > 0 ? row2Photos : photos).map((photo, index) =>
                        renderPhotoCard(photo, index)
                      )}
                    </div>
                    <div
                      className="flex gap-3 animate-marquee-reverse group-hover:[animation-play-state:paused] shrink-0"
                      aria-hidden="true"
                    >
                      {duplicatePhotos(row2Photos.length > 0 ? row2Photos : photos).map((photo, index) =>
                        renderPhotoCard(photo, index + '-dup')
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full-Screen Viewing */}
      {activeLightboxIndex !== null && photos[activeLightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveLightboxIndex(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-200"
            onClick={(e) => e.stopPropagation()}
          >
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
