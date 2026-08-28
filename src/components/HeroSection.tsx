import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, Heart, Wand2, PartyPopper, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PartyDetails } from '../types';
import { audioEngine } from '../utils/audioSynth';

interface HeroSectionProps {
  party: PartyDetails;
  onRsvpClick: () => void;
  onDirectionsClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  party,
  onRsvpClick,
  onDirectionsClick,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position for subtle scroll-based parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle pointer / mouse movement for 3D depth
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const triggerPinchMagic = () => {
    audioEngine.playSparkleSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.35 },
      colors: ['#FF69B4', '#38BDF8', '#C084FC', '#FBBF24', '#F472B6']
    });
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(party.eventTitle);
    const details = encodeURIComponent(
      `${party.subtitle}\nTheme: ${party.themeNotes}\nDress code: ${party.dressCode}\nContact: ${party.contactName} (${party.contactPhone})`
    );
    const location = encodeURIComponent(`${party.venueName}, ${party.venueAddress}, ${party.venueCityState}`);
    
    // Oct 3, 2026 2:00 PM to 6:00 PM (20261003T140000 to 20261003T180000)
    const startDate = '20261003T140000';
    const endDate = '20261003T180000';
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    
    window.open(googleCalUrl, '_blank');
  };

  // Compute layered parallax transforms
  const scrollOffsetBg = Math.min(scrollY * 0.15, 30);
  const scrollOffsetFg = Math.min(scrollY * -0.2, 40);

  const bgTransform = isHovered
    ? `translate3d(${tilt.y * -0.6}px, ${tilt.x * 0.6 + scrollOffsetBg}px, -20px) scale(1.12)`
    : `translate3d(0px, ${scrollOffsetBg}px, -20px) scale(1.08)`;

  const fgTransform = isHovered
    ? `translate3d(${tilt.y * 1.3}px, ${tilt.x * -1.3 + scrollOffsetFg}px, 45px) scale(1.04)`
    : `translate3d(0px, ${scrollOffsetFg}px, 30px) scale(1)`;

  const badgeTransform = isHovered
    ? `translate3d(${tilt.y * 1.8}px, ${tilt.x * -1.8}px, 60px)`
    : 'translate3d(0px, 0px, 40px)';

  return (
    <section id="hero-celebrant-section" className="relative pt-4 pb-10 w-full overflow-hidden">
      {/* Background Decorative Gradient & Sprinkles */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-100/70 via-purple-50/50 to-transparent pointer-events-none" />

      {/* Floating Sprinkles */}
      <div className="absolute top-4 left-6 text-pink-300 animate-float opacity-70">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="absolute top-12 right-6 text-teal-300 animate-float-reverse opacity-70">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="w-full relative z-10 flex flex-col items-center text-center">
        {/* Hero Photo Card - Full width with 10px padding on each side */}
        <div className="w-full px-[10px] flex justify-center">
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            className="relative w-full max-w-lg aspect-square sm:aspect-[4/3] my-2 rounded-3xl select-none [perspective:1000px] group cursor-default"
          >
            {/* Main 3D Card Base with preserve-3d */}
            <div
              className="relative w-full h-full rounded-3xl transition-transform duration-300 ease-out shadow-2xl border-4 border-white/90 overflow-visible bg-transparent"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              }}
            >
              {/* 1. Background Image Layer */}
              <div
                className="absolute inset-0 rounded-[22px] overflow-hidden transition-transform duration-300 ease-out bg-transparent"
                style={{
                  transform: bgTransform,
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src={party.heroImageUrl}
                  alt={`${party.celebrantName} background`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* 2. Cutout Image Layer (Directly on top of background image) */}
              {party.heroCutoutImageUrl && (
                <div
                  className="absolute inset-0 rounded-[22px] overflow-hidden pointer-events-none transition-transform duration-300 ease-out z-20 bg-transparent"
                  style={{
                    transform: fgTransform,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={party.heroCutoutImageUrl}
                    alt={`${party.celebrantName} cutout`}
                    className="w-full h-full object-cover pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* LAYER 4 (Top Canopy): Animated Gabby Cat Ears */}
              <div
                className="absolute -top-7 inset-x-0 flex justify-between px-6 z-30 pointer-events-none transition-transform duration-300 ease-out"
                style={{
                  transform: `translate3d(${tilt.y * 1.5}px, ${tilt.x * -1.5}px, 50px)`
                }}
              >
                {/* Left Cat Ear with Bow */}
                <div className="relative w-12 h-12 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-tl-3xl rounded-tr-lg border-2 border-white shadow-xl transform -rotate-12 flex items-center justify-center">
                  <div className="w-6 h-6 bg-pink-200 rounded-tl-2xl rounded-tr-md" />
                  <div className="absolute -bottom-1 -right-1 text-xs">🎀</div>
                </div>

                {/* Right Cat Ear */}
                <div className="w-12 h-12 bg-gradient-to-tl from-purple-500 to-pink-400 rounded-tr-3xl rounded-tl-lg border-2 border-white shadow-xl transform rotate-12 flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-200 rounded-tr-2xl rounded-tl-md" />
                </div>
              </div>

              {/* LAYER 5 (Floating Badge): "Turning 3!" Age Pill */}
              <div
                className="absolute -bottom-4 inset-x-0 flex justify-center z-40 transition-transform duration-300 ease-out pointer-events-none"
                style={{
                  transform: badgeTransform
                }}
              >
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-1.5 animate-bounce">
                  <PartyPopper className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Turning {party.celebrantAge}!</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Celebrant Title & Header */}
        <div className="mt-4 px-4 space-y-1.5">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100/90 text-pink-700 text-xs font-bold tracking-wide">
            <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
            Pool Party Celebration
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-800 tracking-tight leading-tight">
            {party.celebrantName}&apos;s {party.celebrantAge}rd Birthday!
          </h1>

          <p className="text-sm font-medium text-slate-600 max-w-xs mx-auto leading-relaxed">
            {party.subtitle}
          </p>
        </div>

        {/* Gabby Magic Quote Box */}
        <div className="mt-4 p-3 rounded-2xl bg-white/90 border border-pink-200/80 shadow-sm max-w-sm w-full relative">
          <p className="text-xs text-slate-700 font-medium italic">
            {party.celebrantBirthdayQuote}
          </p>
          <button
            onClick={triggerPinchMagic}
            className="mt-2 text-[11px] font-bold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-full border border-pink-200 transition-colors cursor-pointer"
          >
            <Wand2 className="w-3 h-3 text-pink-500" />
            Pinch for Dollhouse Magic! ✨
          </button>
        </div>

        {/* Date & Time Highlight Card */}
        <div className="mt-4 w-full max-w-sm bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-0.5 rounded-2xl shadow-md">
          <div className="bg-white rounded-[14px] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{party.dateDisplay}</p>
                <p className="text-xs text-pink-600 font-medium">{party.timeDisplay}</p>
              </div>
            </div>
            <button
              onClick={handleAddToCalendar}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors shrink-0 cursor-pointer"
              title="Add to Google Calendar"
            >
              + Cal
            </button>
          </div>
        </div>

        {/* Quick CTA Action Row */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 w-full max-w-sm">
          <button
            id="hero-rsvp-btn"
            onClick={onRsvpClick}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-300/40 flex items-center justify-center gap-1.5 transition-all duration-150 transform active:scale-97 hover:-translate-y-0.5 cursor-pointer"
          >
            <PartyPopper className="w-4 h-4" />
            RSVP Attending
          </button>

          <button
            id="hero-directions-btn"
            onClick={onDirectionsClick}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-300/40 flex items-center justify-center gap-1.5 transition-all duration-150 transform active:scale-97 hover:-translate-y-0.5 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            Location &amp; Map
          </button>
        </div>
      </div>
    </section>
  );
};


