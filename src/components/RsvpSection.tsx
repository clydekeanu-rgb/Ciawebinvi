import React, { useState } from 'react';
import { PartyPopper, Check, Send, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PartyDetails, RsvpSubmission } from '../types';
import { audioEngine } from '../utils/audioSynth';

interface RsvpSectionProps {
  party: PartyDetails;
  rsvps: RsvpSubmission[];
  onSubmitRsvp: (rsvp: RsvpSubmission) => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  party,
  rsvps,
  onSubmitRsvp
}) => {
  const [guestName, setGuestName] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');
  const [adultsCount, setAdultsCount] = useState(1);
  const [kidsCount, setKidsCount] = useState(1);
  const [wish, setWish] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'guestlist'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newRsvp: RsvpSubmission = {
      id: `rsvp-${Date.now()}`,
      guestName: guestName.trim(),
      emailOrPhone: '',
      attending,
      adultsCount: attending === 'yes' ? adultsCount : 0,
      kidsCount: attending === 'yes' ? kidsCount : 0,
      kidsNames: '',
      dietaryRestrictions: '',
      birthdayWish: wish.trim(),
      submittedAt: new Date().toLocaleDateString()
    };

    onSubmitRsvp(newRsvp);
    setIsSubmitted(true);

    if (attending === 'yes') {
      audioEngine.playConfettiPopSound();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#FF69B4', '#A855F7', '#38BDF8', '#F59E0B']
      });
    }
  };

  const totalAttendingGuests = rsvps
    .filter(r => r.attending === 'yes')
    .reduce((sum, r) => sum + r.adultsCount + r.kidsCount, 0);

  const totalKidsCount = rsvps
    .filter(r => r.attending === 'yes')
    .reduce((sum, r) => sum + r.kidsCount, 0);

  return (
    <section id="rsvp-section" className="px-4 py-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-pink-300 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
                RSVP for the Party
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Please reply by {party.rsvpDeadline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-pink-50 p-1 rounded-xl border border-pink-100 text-xs font-bold">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'form' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              Reply
            </button>
            <button
              onClick={() => setActiveTab('guestlist')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'guestlist' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              <span>Guests</span>
              <span className="bg-white/90 text-pink-700 text-[10px] px-1.5 py-0.2 rounded-full">
                {rsvps.filter(r => r.attending === 'yes').length}
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'form' ? (
          isSubmitted ? (
            <div className="text-center py-6 px-3 bg-gradient-to-b from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-800">
                {attending === 'yes' ? "Woohoo! You're on the Guest List! 🎉" : "Thank you for letting us know! 💕"}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                {attending === 'yes'
                  ? `We are so excited to celebrate ${party.celebrantName}'s ${party.celebrantAge}rd birthday with you!`
                  : `We'll miss you at the Dollhouse, but thank you for your sweet wishes!`}
              </p>

              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 text-xs font-bold text-pink-600 hover:text-pink-700 underline cursor-pointer"
              >
                Submit another response / update RSVP
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Attending choice pills */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttending('yes')}
                  className={`p-3 rounded-2xl font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    attending === 'yes'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-md shadow-pink-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-base mb-0.5">🎉</span>
                  <span>Yes, We&apos;ll Be There!</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttending('no')}
                  className={`p-3 rounded-2xl font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    attending === 'no'
                      ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white border-slate-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base mb-0.5">💌</span>
                  <span>Sadly Can&apos;t Make It</span>
                </button>
              </div>

              {/* Guest Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Family / Guest Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Anderson Family / Jessica"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                  required
                />
              </div>

              {attending === 'yes' && (
                /* Guest Counters */
                <div className="grid grid-cols-2 gap-3 bg-pink-50/70 p-3 rounded-2xl border border-pink-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Number of Kids 🧒
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-pink-200 font-bold text-pink-600 flex items-center justify-center hover:bg-pink-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-800 w-4 text-center">
                        {kidsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setKidsCount(kidsCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-pink-200 font-bold text-pink-600 flex items-center justify-center hover:bg-pink-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Number of Adults 🧑
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdultsCount(Math.max(0, adultsCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-pink-200 font-bold text-pink-600 flex items-center justify-center hover:bg-pink-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-800 w-4 text-center">
                        {adultsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdultsCount(adultsCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-pink-200 font-bold text-pink-600 flex items-center justify-center hover:bg-pink-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Birthday wish */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-purple-500" />
                  Birthday Wish for {party.celebrantName} 💕
                </label>
                <textarea
                  rows={2}
                  placeholder={`Send a cute birthday note to ${party.celebrantName}...`}
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Confirm RSVP
              </button>
            </form>
          )
        ) : (
          /* Guest List View */
          <div className="space-y-3">
            {/* Stats bar */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-pink-50 p-2.5 rounded-2xl border border-pink-200">
                <span className="text-[10px] text-pink-600 font-bold block uppercase">Total Guests</span>
                <span className="text-xl font-extrabold text-pink-700">{totalAttendingGuests}</span>
              </div>
              <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-200">
                <span className="text-[10px] text-purple-600 font-bold block uppercase">Kids Coming</span>
                <span className="text-xl font-extrabold text-purple-700">{totalKidsCount}</span>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {rsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{rsvp.attending === 'yes' ? '🎉' : '💌'}</span>
                      <span>{rsvp.guestName}</span>
                    </div>
                    {rsvp.attending === 'yes' && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {rsvp.kidsCount} Kids • {rsvp.adultsCount} Adults
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      rsvp.attending === 'yes'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rsvp.attending === 'yes' ? 'Attending' : 'Declined'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
