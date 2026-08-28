import React from 'react';
import { Calendar, Sparkles, Wand2, Cake, Music, Gift } from 'lucide-react';
import { TimelineEvent } from '../types';

interface PartyTimelineProps {
  timeline: TimelineEvent[];
}

export const PartyTimeline: React.FC<PartyTimelineProps> = ({ timeline }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      case 'Wand2':
        return <Wand2 className="w-4 h-4 text-cyan-500" />;
      case 'Cake':
        return <Cake className="w-4 h-4 text-amber-500" />;
      case 'Music':
        return <Music className="w-4 h-4 text-purple-500" />;
      case 'Gift':
        return <Gift className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-pink-500" />;
    }
  };

  return (
    <section id="party-timeline-section" className="px-4 py-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-pink-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">
                Party Schedule &amp; Timeline
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Pool splash itinerary</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
            2:00 PM – 6:00 PM
          </span>
        </div>

        {/* Timeline Events List */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-pink-300 before:via-purple-300 before:to-teal-300">
          {timeline.map((event, idx) => (
            <div key={event.id || idx} className="relative group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-pink-400 shadow-md flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
              </div>

              {/* Event Card */}
              <div className="bg-gradient-to-br from-pink-50/60 via-purple-50/40 to-teal-50/40 rounded-2xl p-3.5 border border-pink-100/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-pink-600 bg-white px-2 py-0.5 rounded-md border border-pink-200 shadow-2xs">
                    {event.time}
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {getIcon(event.iconName)}
                    {event.badge}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-800 mt-1.5">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
