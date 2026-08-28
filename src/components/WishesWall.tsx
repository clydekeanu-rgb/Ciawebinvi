import React, { useState } from 'react';
import { Heart, Sparkles, Send, MessageCircleHeart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthdayWish } from '../types';

interface WishesWallProps {
  wishes: BirthdayWish[];
  celebrantName: string;
  onAddWish: (wish: BirthdayWish) => void;
  onLikeWish: (wishId: string) => void;
}

export const WishesWall: React.FC<WishesWallProps> = ({
  wishes,
  celebrantName,
  onAddWish,
  onLikeWish
}) => {
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('💖');

  const stickers = ['💖', '🐱', '✨', '🧁', '👑', '🎉', '🦄', '🎈'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    const newWish: BirthdayWish = {
      id: `wish-${Date.now()}`,
      sender: senderName.trim(),
      message: message.trim(),
      sticker: selectedSticker,
      timestamp: 'Just now',
      likes: 1
    };

    onAddWish(newWish);
    setSenderName('');
    setMessage('');

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.85 }
    });
  };

  return (
    <section id="wishes-wall-section" className="px-4 py-3 max-w-md lg:max-w-none mx-auto">
      <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-fuchsia-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-fuchsia-100 flex items-center justify-center text-fuchsia-600">
              <MessageCircleHeart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
                Wall of Wishes &amp; Love
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Sweet birthday notes for {celebrantName}</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-fuchsia-600 bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 rounded-full">
            {wishes.length} Wishes ✨
          </span>
        </div>

        {/* Wishes Cards Grid */}
        <div className="space-y-2.5 mb-5 max-h-72 overflow-y-auto pr-1">
          {wishes.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-pink-50/70 rounded-2xl p-3 border border-pink-100 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{item.sticker}</span>
                  <span className="font-heading font-bold text-xs text-slate-800">
                    {item.sender}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {item.timestamp}
                </span>
              </div>

              <p className="text-xs text-slate-700 mt-1 pl-6 leading-relaxed">
                {item.message}
              </p>

              <div className="mt-2 pl-6 flex items-center justify-end">
                <button
                  onClick={() => onLikeWish(item.id)}
                  className="text-[10px] font-bold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-pink-200 shadow-2xs transition-transform active:scale-95"
                >
                  <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                  <span>{item.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Post a Wish Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5 text-xs">
          <p className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-500" />
            Leave a Birthday Note:
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your Name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-1/2 p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-400 bg-white text-xs"
              required
            />
            {/* Sticker picker */}
            <div className="w-1/2 flex items-center justify-around bg-white p-1 rounded-xl border border-slate-200">
              {stickers.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSticker(s)}
                  className={`text-base p-0.5 rounded-md ${selectedSticker === s ? 'bg-pink-100 scale-125' : 'opacity-70'}`}
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-400 bg-white text-xs"
              required
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-xs hover:from-pink-600 hover:to-purple-700 flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
