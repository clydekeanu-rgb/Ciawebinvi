import React, { useState, useEffect } from 'react';
import { initialPartyDetails, initialBirthdayWishes, partyConfig } from './data/partyData';
import { PartyDetails, RsvpSubmission, BirthdayWish } from './types';
import { fetchWishesFromGoogleSheet, postWishToGoogleSheet, likeWishInGoogleSheet, fetchRsvpsFromGoogleSheet, postRsvpToGoogleSheet } from './services/googleSheets';
import { useCurrentRoute } from './utils/router';
import { PreEventPage } from './pages/PreEventPage';
import { DuringEventPage } from './pages/DuringEventPage';
import { AfterEventPage } from './pages/AfterEventPage';
import { QuickUploadPage } from './pages/QuickUploadPage';

export default function App() {
  const party: PartyDetails = initialPartyDetails;
  const { route } = useCurrentRoute(partyConfig.homepageMode);

  const [rsvps, setRsvps] = useState<RsvpSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('gabby_party_rsvps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishes, setWishes] = useState<BirthdayWish[]>(() => {
    try {
      const saved = localStorage.getItem('gabby_party_wishes');
      return saved ? JSON.parse(saved) : initialBirthdayWishes;
    } catch {
      return initialBirthdayWishes;
    }
  });

  useEffect(() => {
    localStorage.setItem('gabby_party_rsvps', JSON.stringify(rsvps));
  }, [rsvps]);

  useEffect(() => {
    localStorage.setItem('gabby_party_wishes', JSON.stringify(wishes));
  }, [wishes]);

  // Fetch live wishes & RSVPs from Google Sheets if configured
  useEffect(() => {
    fetchWishesFromGoogleSheet().then(remoteWishes => {
      if (remoteWishes && Array.isArray(remoteWishes) && remoteWishes.length > 0) {
        setWishes(remoteWishes);
      }
    });

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

  return (
    <>
      {route === 'upload' && (
        <QuickUploadPage
          celebrantName={party.celebrantName}
        />
      )}

      {route === 'during' && (
        <DuringEventPage
          party={party}
          wishes={wishes}
          onAddWish={handleAddWish}
          onLikeWish={handleLikeWish}
        />
      )}

      {route === 'after' && (
        <AfterEventPage
          party={party}
          wishes={wishes}
          onAddWish={handleAddWish}
          onLikeWish={handleLikeWish}
        />
      )}

      {(route === 'before' || route === 'pre') && (
        <PreEventPage
          party={party}
          rsvps={rsvps}
          wishes={wishes}
          onAddRsvp={handleAddRsvp}
          onAddWish={handleAddWish}
          onLikeWish={handleLikeWish}
        />
      )}
    </>
  );
}
