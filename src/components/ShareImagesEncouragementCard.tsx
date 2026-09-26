import React from 'react';
import { Camera, Sparkles, Heart, MessageSquare, Upload } from 'lucide-react';

interface ShareImagesEncouragementCardProps {
  celebrantName: string;
  onUploadClick?: () => void;
}

export const ShareImagesEncouragementCard: React.FC<ShareImagesEncouragementCardProps> = ({
  celebrantName,
  onUploadClick,
}) => {
  const handleScrollToUploader = () => {
    if (onUploadClick) {
      onUploadClick();
      return;
    }
    const el = document.getElementById('guest-photos-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="encourage-share-images-section" className="px-4 py-2 max-w-md lg:max-w-none mx-auto">
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 p-0.5 rounded-3xl shadow-xl">
        <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-5 sm:p-6 text-center space-y-3">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold">
            <Camera className="w-3.5 h-3.5 text-pink-600" />
            <span>SHARE THE PARTY MEMORIES</span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-800 leading-snug">
            We Encourage You to Share Images! 📸✨
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Help us capture every smile, splash, and celebration! If you take photos or selfies of {celebrantName}, friends, or party fun, please upload them to her live Facebook-style community feed below so our family can treasure these memories forever. 💕
          </p>

          {/* 3 Visual Step Cards */}
          <div className="grid grid-cols-3 gap-2 pt-2 max-w-md mx-auto">
            <div className="p-2.5 rounded-2xl bg-pink-50/80 border border-pink-100 text-center">
              <span className="text-xl">🤳</span>
              <p className="text-[11px] font-bold text-slate-800 mt-1">1. Snap</p>
              <p className="text-[9px] text-slate-500 leading-tight">Pool fun &amp; smiles</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-50/80 border border-purple-100 text-center">
              <span className="text-xl">🚀</span>
              <p className="text-[11px] font-bold text-slate-800 mt-1">2. Upload</p>
              <p className="text-[9px] text-slate-500 leading-tight">Add to live feed</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-teal-50/80 border border-teal-100 text-center">
              <span className="text-xl">💬</span>
              <p className="text-[11px] font-bold text-slate-800 mt-1">3. React</p>
              <p className="text-[9px] text-slate-500 leading-tight">Like &amp; comment</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            <button
              onClick={handleScrollToUploader}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-md shadow-pink-200 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photos to Feed Below ↓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
