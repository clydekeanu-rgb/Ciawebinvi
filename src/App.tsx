import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Heart, MapPin, Clock, Calendar, Mail, Share2, Music, Check, Volume2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { InteractiveEnvelope } from './components/InteractiveEnvelope';
import { HeroSection } from './components/HeroSection';
import { CountdownTimer } from './components/CountdownTimer';
import { VenueMapSection } from './components/VenueMapSection';
import { PartyDetailsCard } from './components/PartyDetailsCard';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { GuestPhotoSection } from './components/GuestPhotoSection';
import { RsvpSection } from './components/RsvpSection';
import { WishesWall } from './components/WishesWall';
import { MusicPlayer } from './components/MusicPlayer';
import { ScrollReveal } from './components/ScrollReveal';
import { initialPartyDetails, initialBirthdayWishes } from './data/partyData';
import { PartyDetails, RsvpSubmission, BirthdayWish } from './types';
import { audioEngine } from './utils/audioSynth';
import { fetchWishesFromGoogleSheet, postWishToGoogleSheet, likeWishInGoogleSheet, fetchRsvpsFromGoogleSheet, postRsvpToGoogleSheet } from './services/googleSheets';
import { Dock, DockIcon } from './components/magicui/dock';

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const party: PartyDetails = initialPartyDetails;

  const [rsvps, setRsvps] = useState<RsvpSubmission[]>([]);
  const [wishes, setWishes] = useState<BirthdayWish[]>([]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    localStorage.setItem('gabby_party_rsvps', JSON.stringify(rsvps));
  }, [rsvps]);

  useEffect(() => {
    localStorage.setItem('gabby_party_wishes', JSON.stringify(wishes));
  }, [wishes]);

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

  const handleOpenEnvelope = () => {
    setIsOpened(true);
    audioEngine.startMusic();
  };

  const handleCloseEnvelope = () => {
    setIsOpened(false);
  };

  useEffect(() => {
    // Fetch live wishes from Google Sheet if Web App URL is configured
    fetchWishesFromGoogleSheet().then(remoteWishes => {
      if (remoteWishes && Array.isArray(remoteWishes) && remoteWishes.length > 0) {
        setWishes(remoteWishes);
      }
    });

    // Fetch live RSVPs from Google Sheet if Web App URL is configured
    fetchRsvpsFromGoogleSheet().then(remoteRsvps => {
      if (remoteRsvps && Array.isArray(remoteRsvps) && remoteRsvps.length > 0) {
        setRsvps(remoteRsvps);
      }
    });
  }, []);

  const handleAddRsvp = (newRsvp: RsvpSubmission) => {
    setRsvps(prev => [newRsvp, ...prev]);
    postRsvpToGoogleSheet(newRsvp);
    if (newRsvp.birthdayWish) {
      const createdWish: BirthdayWish = {
        id: `wish-${Date.now()}`,
        sender: newRsvp.guestName,
        message: newRsvp.birthdayWish,
        sticker: '🎉',
        timestamp: 'Just now',
        likes: 1
      };
      setWishes(prev => [createdWish, ...prev]);
      postWishToGoogleSheet(createdWish);
    }
  };

  const handleAddWish = (newWish: BirthdayWish) => {
    setWishes(prev => [newWish, ...prev]);
    postWishToGoogleSheet(newWish);
  };

  const handleLikeWish = (wishId: string) => {
    setWishes(prev =>
      prev.map(w => (w.id === wishId ? { ...w, likes: w.likes + 1 } : w))
    );
    likeWishInGoogleSheet(wishId);
  };

  const handleShareInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: `${party.celebrantName}'s 3rd Birthday Party Invitation!`,
        text: `You're invited to ${party.celebrantName}'s Birthday Pool Party! 🏊‍♀️✨`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Initial Interactive Envelope Screen
  if (!isOpened) {
    return (
      <InteractiveEnvelope
        party={party}
        onOpen={handleOpenEnvelope}
      />
    );
  }

  // 2. Main Mobile-First Birthday Invitation Website
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
            <span className="text-lg">🐱</span>
            <div>
              <p className="text-xs font-bold font-heading text-slate-800 leading-tight">
                {party.celebrantName}&apos;s 3rd Birthday!
              </p>
              <p className="text-[10px] text-pink-600 font-medium">
                {party.dateDisplay}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Replay Envelope */}
            <button
              onClick={handleCloseEnvelope}
              className="p-1.5 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
              title="Close and Replay Interactive Envelope"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Share / Copy Link */}
            <button
              onClick={handleShareInvite}
              className="p-1.5 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
              title="Share Invitation"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md lg:max-w-6xl mx-auto relative z-10 pt-24 px-2 sm:px-4">
        {/* Widescreen Desktop 2-Column Split Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          {/* Left Column (Sticky Hero Profile on Desktop) */}
          <div className="lg:col-span-5 space-y-2 lg:sticky lg:top-28">
            <ScrollReveal delay={0}>
              <HeroSection
                party={party}
                onRsvpClick={() => scrollToSection('rsvp-section')}
                onDirectionsClick={() => scrollToSection('venue-location-section')}
              />
            </ScrollReveal>
          </div>

          {/* Right Column (Content Feed on Desktop): Countdown, Gallery, Map, Details, RSVP & Wishes */}
          <div className="lg:col-span-7 space-y-2 mt-4 lg:mt-0">
            {/* Live Countdown Timer */}
            <ScrollReveal delay={50}>
              <CountdownTimer
                targetDateIso={party.dateIso}
                celebrantName={party.celebrantName}
                celebrantAge={party.celebrantAge}
              />
            </ScrollReveal>
            {/* Celestine Photo Gallery */}
            <ScrollReveal delay={50}>
              <PhotoGallerySection />
            </ScrollReveal>

            {/* Venue Map Link & Directions */}
            <ScrollReveal delay={50}>
              <VenueMapSection party={party} />
            </ScrollReveal>

            {/* Party Details (Dress Code & Anything from the Heart) */}
            <ScrollReveal delay={50}>
              <PartyDetailsCard party={party} />
            </ScrollReveal>

            {/* RSVP Section & Confirmed Guests */}
            <ScrollReveal delay={50}>
              <RsvpSection
                party={party}
                rsvps={rsvps}
                onSubmitRsvp={handleAddRsvp}
              />
            </ScrollReveal>

            {/* Guest Photo Gallery & Memory Uploader */}
            <ScrollReveal delay={50}>
              <GuestPhotoSection celebrantName={party.celebrantName} />
            </ScrollReveal>

            {/* Wall of Wishes */}
            <ScrollReveal delay={50}>
              <WishesWall
                wishes={wishes}
                celebrantName={party.celebrantName}
                onAddWish={handleAddWish}
                onLikeWish={handleLikeWish}
              />
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
                href="https://www.clydeabenojar.site"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-pink-600 hover:text-purple-600 underline transition-colors cursor-pointer"
              >
                Clyde Abenojar
              </a>
            </p>
          </div>
        </footer>
      </main>

      {/* Floating Magic UI Navigation Dock */}
      <div className="fixed bottom-4 inset-x-0 z-50 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto">
          <Dock magnification={64} distance={130}>
            <DockIcon label="Home 🐱" onClick={() => scrollToSection('hero-celebrant-section')}>
              <span className="text-xl">🐱</span>
            </DockIcon>
            <DockIcon label="Share Photos 📸" onClick={() => scrollToSection('guest-photos-section')}>
              <Camera className="w-5 h-5 text-teal-500" />
            </DockIcon>
            <DockIcon label="Map & Directions 📍" onClick={() => scrollToSection('venue-location-section')}>
              <MapPin className="w-5 h-5 text-indigo-500" />
            </DockIcon>
            <DockIcon label="Dress Code & Gifts 🎁" onClick={() => scrollToSection('party-details-section')}>
              <span className="text-lg">🎀</span>
            </DockIcon>
            <DockIcon label="RSVP Now 💌" onClick={() => scrollToSection('rsvp-section')}>
              <Mail className="w-5 h-5 text-rose-500" />
            </DockIcon>
          </Dock>
        </div>
      </div>

      {/* Floating Zootopia & Gabby Music Player */}
      <MusicPlayer />
    </div>
  );
}
