import React from 'react';
import { Sparkles, Phone, ShieldAlert, HeartHandshake } from 'lucide-react';
import { PartyDetails } from '../types';

interface PartyDetailsCardProps {
  party: PartyDetails;
}

export const PartyDetailsCard: React.FC<PartyDetailsCardProps> = ({ party }) => {
  return (
    <section id="party-details-section" className="px-4 py-6 max-w-md mx-auto">
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
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-3.5 border border-purple-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1.5">
                <span>🎁</span>
                <span>Gift &amp; Sizing Quick Hints</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  👕 {party.childSizes.clothing}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  👟 {party.childSizes.shoes}
                </span>
                <span className="text-[10px] font-bold text-pink-700 bg-white px-2 py-0.5 rounded-full border border-pink-200">
                  🎨 {party.childSizes.favoriteColors.slice(0, 2).join(' & ')}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
