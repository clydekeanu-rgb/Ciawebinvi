import React, { useEffect, useState } from 'react';
import { Mail, Calendar, X } from 'lucide-react';

interface RsvpReminderModalProps {
  onAcknowledge: () => void;
}

export const RsvpReminderModal: React.FC<RsvpReminderModalProps> = ({ onAcknowledge }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show modal after a short delay so the page has time to render
    const timer = setTimeout(() => setIsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onAcknowledge}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border-2 border-pink-300">
        {/* Decorative top gradient bar */}
        <div className="h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-rose-400" />

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-extrabold font-heading text-slate-800 mb-2">
            RSVP Reminder 💌
          </h2>

          {/* Body */}
          <p className="text-sm text-slate-600 mb-1">
            Please confirm your attendance by
          </p>
          <div className="inline-flex items-center gap-2 bg-pink-50 border-2 border-pink-200 rounded-2xl px-4 py-2 mb-4">
            <Calendar className="w-4 h-4 text-pink-500" />
            <span className="font-extrabold text-pink-700 text-base">
              September 5, 2026
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            This helps us plan the party activities and treats for everyone!
          </p>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={onAcknowledge}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              I'll RSVP Soon!
            </button>
            <button
              onClick={() => {
                // Scroll to RSVP section instead
                const el = document.getElementById('rsvp-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                onAcknowledge();
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition-all cursor-pointer"
            >
              RSVP Now →
            </button>
          </div>

          {/* Dismiss hint */}
          <p className="mt-4 text-[10px] text-slate-400">
            Tap outside to close
          </p>
        </div>
      </div>
    </div>
  );
};
