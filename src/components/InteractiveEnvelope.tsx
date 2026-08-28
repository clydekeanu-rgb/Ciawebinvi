import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Star, Music, Volume2 } from 'lucide-react';
import { audioEngine } from '../utils/audioSynth';
import { PartyDetails } from '../types';

interface InteractiveEnvelopeProps {
  party: PartyDetails;
  onOpen: () => void;
}

export const InteractiveEnvelope: React.FC<InteractiveEnvelopeProps> = ({ party, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenEnvelope = () => {
    if (isOpening || isOpen) return;
    setIsOpening(true);

    // Play sounds & start party music (auto music play requested by user!)
    audioEngine.playEnvelopeOpenSound();
    audioEngine.startMusic('zootopia');

    // Confetti burst from both sides!
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#FF69B4', '#FFB6C1', '#BA55D3', '#00CED1', '#FFD700', '#FF1493']
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    setIsOpen(true);

    // Transition to main invitation view after letter slides up
    setTimeout(() => {
      onOpen();
    }, 1500);
  };

  return (
    <div
      id="envelope-welcome-screen"
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-[#FFF0F5] via-[#F3E8FF] to-[#E6FFFA]"
    >
      {/* Decorative Dollhouse Floating Background Elements */}
      <div className="absolute inset-0 dollhouse-dots opacity-40 pointer-events-none" />

      {/* Floating sprinkles and stars */}
      <div className="absolute top-10 left-8 text-pink-400 animate-float opacity-80 pointer-events-none">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute top-20 right-10 text-purple-400 animate-float-reverse opacity-80 pointer-events-none">
        <Star className="w-9 h-9 fill-yellow-300 text-yellow-400" />
      </div>
      <div className="absolute bottom-16 left-10 text-teal-400 animate-float opacity-75 pointer-events-none">
        <Heart className="w-8 h-8 fill-pink-300 text-pink-400" />
      </div>
      <div className="absolute bottom-24 right-8 text-pink-400 animate-float-reverse opacity-80 pointer-events-none">
        <Sparkles className="w-7 h-7 text-fuchsia-400" />
      </div>

      {/* Top Header Badge */}
      <div className="text-center z-10 mb-6 max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 border border-pink-200 shadow-sm text-pink-600 font-semibold text-xs tracking-wider uppercase mb-3 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
          Special Dollhouse Delivery!
          <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-800 tracking-tight leading-tight">
          You Have an <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500">A-Meow-Zing</span> Party Invitation!
        </h1>
        <p className="text-slate-600 text-sm mt-1.5 font-medium">
          Tap the envelope below to open & play the party tune! 🎶
        </p>
      </div>

      {/* Interactive Envelope Container */}
      <div className="relative w-full max-w-xs sm:max-w-sm h-80 sm:h-96 flex items-center justify-center [perspective:1000px] z-10">
        <div
          id="interactive-envelope"
          onClick={handleOpenEnvelope}
          className={`relative w-full h-56 sm:h-64 rounded-2xl cursor-pointer transition-all duration-700 select-none group ${
            isOpening ? 'scale-105' : 'hover:scale-102 active:scale-98'
          }`}
        >
          {/* Layer 0: Envelope Interior Back Plate */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-300 via-purple-200 to-rose-200 border-4 border-pink-300 shadow-2xl overflow-hidden z-0">
            {/* Cute dollhouse polka dot interior lining */}
            <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-25" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-purple-300/40 to-transparent" />
          </div>

          {/* Layer 1 (When Open): Top Flap flipped backwards behind the rising letter */}
          <div
            id="envelope-flap"
            className={`absolute top-0 inset-x-0 h-32 rounded-t-2xl origin-top transition-all duration-700 ${
              isOpen
                ? 'rotate-x-180 -translate-y-0.5 z-5 shadow-inner'
                : 'rotate-x-0 z-30 shadow-md'
            }`}
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              transformOrigin: 'top center',
              background: isOpen
                ? 'linear-gradient(to top, #f472b6, #e879f9)'
                : 'linear-gradient(to bottom, #ec4899, #f472b6, #fb7185)',
            }}
          />

          {/* Layer 2: Invitation Letter Card (Completely hidden inside until opened) */}
          <div
            id="envelope-letter"
            className={`absolute inset-x-3 sm:inset-x-4 h-56 bg-white rounded-2xl shadow-xl border-2 border-pink-300 p-4 flex flex-col items-center justify-between text-center transition-all duration-1000 ${
              isOpen
                ? '-translate-y-28 sm:-translate-y-32 scale-105 opacity-100 shadow-2xl z-35'
                : 'translate-y-6 opacity-0 pointer-events-none scale-90 z-10'
            }`}
          >
            {/* Cute mini card preview */}
            <div className="w-full flex items-center justify-between border-b border-pink-100 pb-2">
              <span className="text-xs font-bold text-pink-500 flex items-center gap-1">
                🐱 Gabby Dollhouse Party
              </span>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                Turning {party.celebrantAge}!
              </span>
            </div>

            <div className="my-auto py-1 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-400 to-purple-400 p-0.5 shadow-md mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={party.heroCutoutImageUrl || party.heroImageUrl}
                  alt={party.celebrantName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="font-heading font-bold text-lg sm:text-xl text-slate-800 leading-tight">
                {party.celebrantName}&apos;s 3rd Birthday!
              </p>
              <p className="text-xs text-pink-600 font-semibold mt-1">
                {party.dateDisplay}
              </p>
            </div>

            <div className="w-full bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200/70 rounded-xl py-1.5 px-2 text-[11px] text-pink-700 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-500 animate-spin" />
              <span>Unfolding Invitation...</span>
            </div>
          </div>

          {/* Layer 3: Envelope Front Pocket (Opaque Front Side & Bottom folds) */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-20">
            {/* Left side triangle (Solid Opaque) */}
            <div 
              className="absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-100/95"
              style={{
                clipPath: 'polygon(0% 0%, 55% 50%, 0% 100%)'
              }}
            />
            
            {/* Right side triangle (Solid Opaque) */}
            <div 
              className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-purple-300 via-purple-200 to-purple-100/95"
              style={{
                clipPath: 'polygon(100% 0%, 45% 50%, 100% 100%)'
              }}
            />

            {/* Bottom triangle (Solid Opaque, overlapping sides) */}
            <div 
              className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-rose-300 via-pink-200 to-pink-100 shadow-md border-t border-pink-200/80"
              style={{
                clipPath: 'polygon(0% 100%, 50% 30%, 100% 100%)'
              }}
            />

            {/* Subtle bottom edge trim */}
            <div className="absolute bottom-0 inset-x-0 h-2 bg-pink-400/30" />
          </div>

          {/* Layer 4: Wax Seal Button (Click trigger, sits on top when closed) */}
          {!isOpen && (
            <div
              id="wax-seal-button"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center group-hover:scale-108 active:scale-95 transition-all duration-200 ease-out cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 p-1 shadow-2xl flex items-center justify-center ring-4 ring-pink-200/90 animate-pulse relative">
                <div className="w-full h-full rounded-full border-2 border-dashed border-pink-100 flex flex-col items-center justify-center text-white text-center">
                  <div className="text-xl">🐱</div>
                  <span className="text-[10px] font-extrabold uppercase tracking-tighter">
                    OPEN ME
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 text-xs">✨</div>
                <div className="absolute -bottom-1 -left-1 text-xs">💖</div>
              </div>
              <span className="mt-3 text-xs font-bold text-pink-700 bg-white/95 px-3.5 py-1.5 rounded-full shadow-lg border border-pink-200 flex items-center gap-1.5 whitespace-nowrap hover:bg-pink-50 transition-colors">
                <Volume2 className="w-3.5 h-3.5 text-pink-500 animate-bounce" />
                Tap Seal to Open &amp; Play! 🎶
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Music Info Pill */}
      <div className="mt-6 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-purple-200 shadow-sm text-xs text-purple-700 backdrop-blur-xs">
        <Music className="w-4 h-4 text-pink-500 animate-spin" />
        <span>Featuring the <strong>Zootopia 2 Party Song</strong> & Gabby Soundtrack</span>
      </div>
    </div>
  );
};

