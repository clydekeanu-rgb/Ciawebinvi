import React, { useState, useEffect } from 'react';
import { 
  Camera, Sparkles, Heart, MapPin, Mail, Share2, 
  Check, Image, MessageSquareHeart 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HeroSection } from '../components/HeroSection';
import { PhotoGallerySection } from '../components/PhotoGallerySection';
import { GuestPhotoSection } from '../components/GuestPhotoSection';
import { MusicPlayer } from '../components/MusicPlayer';
import { ScrollReveal } from '../components/ScrollReveal';
import { Dock, DockIcon } from '../components/magicui/dock';
import { PartyDetails, BirthdayWish } from '../types';

interface AfterEventPageProps {
  party: PartyDetails;
  wishes: BirthdayWish[];
  onAddWish: (newWish: BirthdayWish) => void;
  onLikeWish: (wishId: string) => void;
}

export const AfterEventPage: React.FC<AfterEventPageProps> = ({
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

  const handleShareAlbum = () => {
    if (navigator.share) {
      navigator.share({
        title: `Thank You! Celestine's 3rd Birthday Pool Party Memories`,
        text: `Thank you for celebrating with Celestine! View and share party photos & memories here:`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleBurstHearts = () => {
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF69B4', '#FFB6C1', '#FF1493', '#E6E6FA', '#FFC0CB']
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
            <span className="text-lg">💖</span>
            <div>
              <p className="text-xs font-bold font-heading text-slate-800 leading-tight">
                Thank You from Celestine &amp; Family!
              </p>
              <p className="text-[10px] text-pink-600 font-medium">
                Celestine&apos;s 3rd Birthday Celebration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBurstHearts}
              className="p-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-600 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              title="Send Love!"
            >
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              <span className="hidden sm:inline">Send Love</span>
            </button>

            <button
              onClick={handleShareAlbum}
              className="p-1.5 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
              title="Share Memories"
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
          {/* Left Column (Sticky Hero Profile on Desktop) - EXACT SAME HERO SECTION */}
          <div className="lg:col-span-5 space-y-2 lg:sticky lg:top-24">
            <ScrollReveal delay={0}>
              <HeroSection
                party={party}
                showRsvpButton={false}
                onDirectionsClick={() => scrollToSection('highlights-gallery')}
              />
            </ScrollReveal>
          </div>

          {/* Right Column (Content Feed on Desktop): Thank You Banner, Notes, Photos, Guest Uploader & Wishes */}
          <div className="lg:col-span-7 space-y-2 mt-4 lg:mt-0">
            {/* Heartfelt Thank You Banner */}
            <ScrollReveal delay={0}>
              <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-teal-400 p-0.5 rounded-3xl shadow-lg">
                <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-5 text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold">
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    <span>THANK YOU FOR CELEBRATING WITH US!</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-800 leading-snug">
                    You Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Celestine&apos;s 3rd Birthday</span> So Unforgettable! ✨
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                    From the bottom of our hearts, thank you to all our wonderful family, godparents, and friends who joined us at Casa de Clara, brought your warmest smiles, sweet gifts, and shared so much laughter and poolside splashes with Celestine!
                  </p>

                  {/* Celebration Fun Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-2.5 bg-pink-50/70 rounded-2xl border border-pink-100 text-center">
                      <span className="text-xl">🐱</span>
                      <p className="font-black text-xs text-pink-700 mt-0.5">Turning 3!</p>
                      <p className="text-[10px] text-slate-500">Purr-fect Milestone</p>
                    </div>

                    <div className="p-2.5 bg-cyan-50/70 rounded-2xl border border-cyan-100 text-center">
                      <span className="text-xl">🏊‍♀️</span>
                      <p className="font-black text-xs text-cyan-700 mt-0.5">Endless Splashes</p>
                      <p className="text-[10px] text-slate-500">Poolside Memories</p>
                    </div>

                    <div className="p-2.5 bg-amber-50/70 rounded-2xl border border-amber-100 text-center">
                      <span className="text-xl">🧁</span>
                      <p className="font-black text-xs text-amber-700 mt-0.5">Cakey Treats</p>
                      <p className="text-[10px] text-slate-500">Sweet Celebrations</p>
                    </div>

                    <div className="p-2.5 bg-purple-50/70 rounded-2xl border border-purple-100 text-center">
                      <span className="text-xl">💖</span>
                      <p className="font-black text-xs text-purple-700 mt-0.5">Endless Love</p>
                      <p className="text-[10px] text-slate-500">From All of You</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Note of Gratitude from Family */}
            <ScrollReveal delay={50}>
              <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-pink-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                    <Heart className="w-4 h-4 fill-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
                      A Note of Gratitude
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">From Celestine &amp; Her Family</p>
                  </div>
                </div>

                <div className="bg-pink-50/70 rounded-2xl p-4 border border-pink-100 text-xs text-slate-700 leading-relaxed space-y-2">
                  <p>
                    Dear Family &amp; Friends,
                  </p>
                  <p>
                    Thank you so much for taking time out of your weekend to celebrate Celestine&apos;s special 3rd birthday at Casa de Clara. Seeing Celestine laugh, swim, and dance with all her favorite people was the greatest gift we could ever ask for.
                  </p>
                  <p>
                    We hope you enjoyed the food, games, and pool splashes as much as she did. Thank you for being such an important and loving part of Celestine&apos;s life!
                  </p>
                  <p className="font-bold text-pink-700 pt-1">
                    With all our love &amp; appreciation,
                    <br />
                    Celestine &amp; Family 💕
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Guest Photo Feed & Wall of Wishes — Facebook-wall-style (wishes interleaved in the feed) */}
            <ScrollReveal delay={50}>
              <GuestPhotoSection
                celebrantName={party.celebrantName}
                defaultView="feed"
                wishes={wishes}
                onAddWish={onAddWish}
                onLikeWish={onLikeWish}
              />
            </ScrollReveal>

            {/* Celestine Photo Highlights Gallery (LAST SECTION) */}
            <ScrollReveal delay={50}>
              <div id="highlights-gallery">
                <PhotoGallerySection />
              </div>
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
            Thank you for being part of Celestine&apos;s 3rd Birthday!
          </p>
          <div className="pt-2 border-t border-pink-100/80">
            <p className="text-[11px] text-slate-500 font-medium">
              Website Invitation &amp; Memories by{' '}
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
            <DockIcon label="Send Hearts 💖" onClick={handleBurstHearts}>
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            </DockIcon>
            <DockIcon label="Photos 📸" onClick={() => scrollToSection('highlights-gallery')}>
              <Image className="w-5 h-5 text-indigo-500" />
            </DockIcon>
            <DockIcon label="Guest Memories 📷" onClick={() => scrollToSection('guest-photos-section')}>
              <Camera className="w-5 h-5 text-teal-500" />
            </DockIcon>
            <DockIcon label="Guestbook 💌" onClick={() => scrollToSection('wishes-section')}>
              <MessageSquareHeart className="w-5 h-5 text-purple-500" />
            </DockIcon>
            <DockIcon label="Share 🔗" onClick={handleShareAlbum}>
              <Share2 className="w-5 h-5 text-amber-500" />
            </DockIcon>
          </Dock>
        </div>
      </div>

      {/* Floating Music Player */}
      <MusicPlayer />
    </div>
  );
};
