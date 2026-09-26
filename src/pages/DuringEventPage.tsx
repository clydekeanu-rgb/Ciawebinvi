import React, { useState, useEffect } from 'react';
import { 
  Camera, Sparkles, Heart, MapPin, Mail, 
  Share2, Check, PartyPopper 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HeroSection } from '../components/HeroSection';
import { VenueMapSection } from '../components/VenueMapSection';
import { WishesWall } from '../components/WishesWall';
import { ShareImagesEncouragementCard } from '../components/ShareImagesEncouragementCard';
import { GuestPhotoSection } from '../components/GuestPhotoSection';
import { MusicPlayer } from '../components/MusicPlayer';
import { ScrollReveal } from '../components/ScrollReveal';
import { Dock, DockIcon } from '../components/magicui/dock';
import { PartyDetails, BirthdayWish } from '../types';

interface DuringEventPageProps {
  party: PartyDetails;
  wishes: BirthdayWish[];
  onAddWish: (newWish: BirthdayWish) => void;
  onLikeWish: (wishId: string) => void;
}

export const DuringEventPage: React.FC<DuringEventPageProps> = ({
  party,
  wishes,
  onAddWish,
  onLikeWish
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Autohide navbar on scroll down, reveal on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 40) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 6) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 6) {
        setIsNavVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleShareInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: `${party.celebrantName}'s 3rd Birthday Pool Party - Live Today!`,
        text: `We're partying right now at Casa de Clara! Come splash and celebrate with Celestine! 🏊‍♀️✨`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleBurstConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF69B4', '#00FFFF', '#FFD700', '#9370DB', '#FF1493']
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F6] via-[#F8F0FC] to-[#E6FFFA] text-slate-800 relative pb-24">
      {/* Background Dollhouse Sparkle Texture */}
      <div className="fixed inset-0 dollhouse-dots opacity-30 pointer-events-none" />

      {/* Autohiding Mobile & Desktop Header */}
      <header
        className={`fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-200 shadow-xs transition-transform duration-300 ${
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-md lg:max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎈</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                  Party In Progress!
                </span>
              </div>
              <p className="text-xs font-bold font-heading text-slate-800 leading-tight">
                {party.celebrantName}&apos;s 3rd Birthday Pool Party
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBurstConfetti}
              className="p-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-600 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              title="Celebrate!"
            >
              <PartyPopper className="w-4 h-4 text-pink-500" />
            </button>

            <button
              onClick={handleShareInvite}
              className="p-1.5 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
              title="Share Live Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md lg:max-w-6xl mx-auto relative z-10 pt-20 sm:pt-24 px-2 sm:px-4">
        {/* Widescreen Desktop 2-Column Split Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          {/* Left Column (Sticky Hero Profile on Desktop) */}
          <div className="lg:col-span-5 space-y-2 lg:sticky lg:top-24">
            <ScrollReveal delay={0}>
              <HeroSection
                party={party}
                showRsvpButton={false}
                onDirectionsClick={() => scrollToSection('venue-location-section')}
              />
            </ScrollReveal>
          </div>

          {/* Right Column (Content Feed on Desktop) */}
          <div className="lg:col-span-7 space-y-3 mt-4 lg:mt-0">
            {/* 1. Live Event Announcement Banner */}
            <ScrollReveal delay={0}>
              <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-teal-400 p-0.5 rounded-3xl shadow-lg">
                <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-4 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                    <span>TODAY IS THE DAY! • {party.dateDisplay}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-800 leading-snug">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-teal-600">Celestine&apos;s Pool Party</span>! 🏊‍♀️✨
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    We are splashing, singing, and celebrating right now at Casa de Clara! Find venue directions, leave sweet birthday wishes, and share your party photos to the community feed below.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* 2. Venue Map Link & Directions */}
            <ScrollReveal delay={50}>
              <VenueMapSection party={party} />
            </ScrollReveal>

            {/* 3. Wall of Wishes */}
            <ScrollReveal delay={50}>
              <div id="wishes-section">
                <WishesWall
                  wishes={wishes}
                  celebrantName={party.celebrantName}
                  onAddWish={onAddWish}
                  onLikeWish={onLikeWish}
                />
              </div>
            </ScrollReveal>

            {/* 4. We Encourage You to Share Images Section */}
            <ScrollReveal delay={50}>
              <ShareImagesEncouragementCard
                celebrantName={party.celebrantName}
                onUploadClick={() => scrollToSection('guest-photos-section')}
              />
            </ScrollReveal>

            {/* 5. Guest Photo Gallery - FACEBOOK FEED STYLE ON DEFAULT (LAST SECTION) */}
            <ScrollReveal delay={50}>
              <GuestPhotoSection celebrantName={party.celebrantName} defaultView="feed" />
            </ScrollReveal>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 px-4 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-pink-500 font-bold">
            <span>✨</span>
            <span>A-Meow-Zing Gabby&apos;s Dollhouse Celebration</span>
            <span>✨</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Featuring Zootopia 2 soundtrack vibes &amp; Dollhouse magic
          </p>
          <div className="pt-2 border-t border-pink-100/80">
            <p className="text-[11px] text-slate-500 font-medium">
              Website Invitation by{' '}
              <a
                href="https://www.curated-pages.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-pink-600 hover:text-purple-600 underline transition-colors cursor-pointer"
              >
                Curated Pages
              </a>
            </p>
          </div>
        </footer>
      </main>

      {/* Floating Magic UI Navigation Dock */}
      <div className="fixed bottom-4 inset-x-0 z-50 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto">
          <Dock magnification={64} distance={130}>
            <DockIcon label="Celebrate 🎉" onClick={handleBurstConfetti}>
              <PartyPopper className="w-5 h-5 text-amber-500" />
            </DockIcon>
            <DockIcon label="Map & Directions 📍" onClick={() => scrollToSection('venue-location-section')}>
              <MapPin className="w-5 h-5 text-indigo-500" />
            </DockIcon>
            <DockIcon label="Wishes 💌" onClick={() => scrollToSection('wishes-section')}>
              <Sparkles className="w-5 h-5 text-rose-500" />
            </DockIcon>
            <DockIcon label="Share Photos 📸" onClick={() => scrollToSection('encourage-share-images-section')}>
              <Camera className="w-5 h-5 text-teal-500" />
            </DockIcon>
          </Dock>
        </div>
      </div>

      {/* Floating Zootopia & Gabby Music Player */}
      <MusicPlayer />
    </div>
  );
};
