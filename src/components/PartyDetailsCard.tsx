import React from 'react';
import { Sparkles, Phone, ShieldAlert, HeartHandshake } from 'lucide-react';
import { PartyDetails } from '../types';

interface PartyDetailsCardProps {
  party: PartyDetails;
}

export const PartyDetailsCard: React.FC<PartyDetailsCardProps> = ({ party }) => {
  return (
    <section id="party-details-section" className="px-4 py-3 max-w-md lg:max-w-none mx-auto">
      <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-amber-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
              Party Theme &amp; Guest Info
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">What to wear &amp; what to expect</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Dress Code Card */}
          <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 rounded-2xl p-3.5 border border-pink-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900 mb-1">
              <span>🎀</span>
              <span>Dress Code &amp; Costumes</span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {party.dressCode}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Cat ears will also be provided at the welcome station for all little guests!
            </p>
          </div>

          {/* Gift & Sizing Quick Reference */}
          {party.childSizes && (
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl p-4 border-2 border-purple-200 shadow-sm relative overflow-hidden">
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-pink-200 text-pink-600 font-extrabold text-xs tracking-wide shadow-2xs mb-1">
                  <span>💖</span>
                  <span>Anything From The Heart!</span>
                  <span>✨</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold font-heading text-slate-800 tracking-tight leading-tight">
                  Anything From The Heart 💕
                </h3>
                <p className="text-xs text-purple-700 font-bold mt-1">
                  Your presence is the greatest gift! But if you wish...
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-purple-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                  Celestine&apos;s Sizing &amp; Favorite Hints:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
                    <span>👕</span>
                    <span>{party.childSizes.clothing}</span>
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
                    <span>👟</span>
                    <span>{party.childSizes.shoes}</span>
                  </span>
                  <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200 flex items-center gap-1">
                    <span>🎨</span>
                    <span>{party.childSizes.favoriteColors.slice(0, 2).join(' & ')}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
