import React, { useState } from 'react';
import { MapPin, Navigation, Copy, Check, Car, ExternalLink, Info, Compass } from 'lucide-react';
import { PartyDetails } from '../types';

interface VenueMapSectionProps {
  party: PartyDetails;
}

export const VenueMapSection: React.FC<VenueMapSectionProps> = ({ party }) => {
  const [copied, setCopied] = useState(false);

  const fullAddress = `${party.venueAddress}, ${party.venueCityState}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${party.venueName} - ${fullAddress}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGoogleMaps = () => {
    window.open(party.googleMapsUrl, '_blank');
  };

  const handleOpenAppleMaps = () => {
    window.open(party.appleMapsUrl, '_blank');
  };

  return (
    <section id="venue-location-section" className="px-4 py-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-purple-200 relative overflow-hidden">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
                Party Location &amp; Directions
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">How to get to the Dollhouse Pavilion</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
            Poolside Venue 🏊‍♀️
          </span>
        </div>

        {/* Venue Info Banner */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-teal-50 rounded-2xl p-4 border border-purple-100 mb-4">
          <h3 className="font-heading font-extrabold text-base text-slate-800 flex items-center gap-1.5">
            <span>🐱</span> {party.venueName}
          </h3>
          <p className="text-xs text-slate-700 font-medium mt-1">
            {party.venueAddress}
          </p>
          <p className="text-xs text-slate-500">
            {party.venueCityState}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="inline-flex items-center gap-1 text-xs font-bold text-pink-700 bg-pink-100/80 hover:bg-pink-200/80 border border-pink-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Maps
            </button>
          </div>
        </div>

        {/* Stylized Visual Interactive Map Preview */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-purple-200 shadow-inner bg-slate-100 group">
          {/* Stylized Map Grid & Roads Background */}
          <div className="absolute inset-0 bg-[#E8ECEF] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:14px_14px]">
            {/* Curving pastel roads / paths */}
            <svg className="w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 400 200">
              <path d="M0,100 Q150,40 250,110 T400,80" fill="none" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" />
              <path d="M0,100 Q150,40 250,110 T400,80" fill="none" stroke="#F472B6" strokeWidth="3" strokeDasharray="8 6" />
              <path d="M180,0 Q200,90 200,200" fill="none" stroke="#FFFFFF" strokeWidth="20" />
              <path d="M180,0 Q200,90 200,200" fill="none" stroke="#93C5FD" strokeWidth="3" strokeDasharray="6 6" />
            </svg>

            {/* Landmarks / Park green areas */}
            <div className="absolute top-2 left-3 bg-emerald-100 border border-emerald-300 rounded-xl px-2 py-1 text-[9px] font-bold text-emerald-800 flex items-center gap-1 shadow-xs">
              🌳 Rainbow Park
            </div>
            <div className="absolute bottom-3 left-4 bg-amber-100 border border-amber-300 rounded-xl px-2 py-1 text-[9px] font-bold text-amber-800 flex items-center gap-1 shadow-xs">
              🅿️ Free Parking Lot 3
            </div>
          </div>

          {/* Center Pin Indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
            <div className="animate-bounce">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-1 shadow-lg flex items-center justify-center text-white ring-4 ring-pink-300/80">
                <span className="text-sm">🐱</span>
              </div>
            </div>
            <div className="bg-slate-900/90 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow mt-1 whitespace-nowrap">
              {party.venueName}
            </div>
          </div>

          {/* Overlay Click to Navigate Action */}
          <div
            onClick={handleOpenGoogleMaps}
            className="absolute inset-0 bg-slate-900/10 hover:bg-slate-900/20 flex items-end justify-end p-2 cursor-pointer transition-colors"
          >
            <span className="bg-white/95 text-pink-600 font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-sm border border-pink-200 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Tap to View Live Route
            </span>
          </div>
        </div>

        {/* Direction Action Buttons */}
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          <button
            id="google-maps-btn"
            onClick={handleOpenGoogleMaps}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs shadow flex items-center justify-center gap-1 transition-all transform active:scale-95 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Google</span>
          </button>

          <button
            id="waze-maps-btn"
            onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(party.venueName + ' ' + party.venueAddress)}`, '_blank')}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow flex items-center justify-center gap-1 transition-all transform active:scale-95 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Waze</span>
          </button>

          <button
            id="apple-maps-btn"
            onClick={handleOpenAppleMaps}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow flex items-center justify-center gap-1 transition-all transform active:scale-95 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Apple</span>
          </button>
        </div>

        {/* Parking & Venue Notes Box */}
        <div className="mt-4 space-y-2 pt-3 border-t border-purple-100">
          <div className="flex items-start gap-2 text-xs text-slate-700 bg-purple-50/70 p-2.5 rounded-xl">
            <Car className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p>
              <strong>Parking:</strong> {party.parkingInfo}
            </p>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-700 bg-pink-50/70 p-2.5 rounded-xl">
            <Info className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
            <p>
              <strong>Special Note:</strong> {party.venueNotes}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
