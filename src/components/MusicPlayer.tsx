import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Disc, Sparkles, X } from 'lucide-react';
import { audioEngine } from '../utils/audioSynth';
import { availableMusicTracks } from '../data/partyData';
import { MusicTrackId } from '../types';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrackId>('zootopia-try-everything');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sync with audio engine state
    setIsPlaying(audioEngine.getIsPlaying());
    setIsMuted(audioEngine.getIsMuted());
    setVolume(audioEngine.getVolume());

    const unsubscribe = audioEngine.subscribe((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-collapse / dim to idle AssistiveTouch state when inactive
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      setIsExpanded(false);
    }, 5000);
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isExpanded, isPlaying]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetIdleTimer();
    if (isPlaying) {
      audioEngine.stopMusic();
    } else {
      audioEngine.startMusic(selectedTrack === 'zootopia-try-everything' ? 'zootopia' : 'gabby');
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetIdleTimer();
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetIdleTimer();
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
  };

  const handleSelectTrack = (trackId: MusicTrackId) => {
    resetIdleTimer();
    setSelectedTrack(trackId);
    audioEngine.stopMusic();
    audioEngine.startMusic(trackId === 'zootopia-try-everything' ? 'zootopia' : 'gabby');
  };

  const currentTrackData = availableMusicTracks.find(t => t.id === selectedTrack) || availableMusicTracks[0];

  return (
    <div
      onMouseMove={resetIdleTimer}
      onTouchStart={resetIdleTimer}
      className={`fixed bottom-24 sm:bottom-28 right-4 z-40 flex flex-col items-end transition-opacity duration-300 ${
        isIdle && !isExpanded ? 'opacity-60 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Expanded AssistiveTouch Popup Card */}
      {isExpanded && (
        <div className="w-72 bg-slate-900/90 backdrop-blur-xl text-white rounded-3xl p-4 shadow-2xl border border-white/20 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Disc className={`w-4 h-4 text-pink-400 ${isPlaying ? 'animate-spin' : ''}`} />
              <span className="text-xs font-bold font-heading">Party Jukebox</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Track Banner */}
          <div className="bg-white/10 rounded-2xl p-2.5 mb-3 flex items-center justify-between border border-white/10">
            <div className="max-w-[170px]">
              <p className="text-xs font-bold truncate text-white">{currentTrackData.title}</p>
              <p className="text-[10px] text-pink-300 truncate">{currentTrackData.movieOrShow}</p>
            </div>
            <button
              onClick={handleTogglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
          </div>

          {/* Track Selector list */}
          <div className="space-y-1.5 mb-3">
            {availableMusicTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                  selectedTrack === track.id
                    ? 'bg-pink-500/30 text-white font-bold border border-pink-400/50'
                    : 'bg-white/5 hover:bg-white/15 text-slate-200'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate font-semibold">{track.title}</p>
                  <p className="text-[10px] text-slate-400">{track.artist}</p>
                </div>
                {selectedTrack === track.id && (
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
            <button
              onClick={handleToggleMute}
              className="text-slate-300 hover:text-white p-1 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-pink-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>
      )}

      {/* Assistive Touch Circular Floating Bubble */}
      <button
        id="assistive-touch-music-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-12 h-12 rounded-full bg-slate-900/85 backdrop-blur-xl shadow-2xl border-2 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center relative ${
          isPlaying
            ? 'border-pink-400 ring-4 ring-pink-400/30 shadow-pink-500/20'
            : 'border-white/30 hover:border-pink-300'
        }`}
        title={isPlaying ? 'Music Playing (Tap for controls)' : 'Tap to play party music'}
      >
        {/* Ring animations when playing */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full animate-ping bg-pink-400/30 pointer-events-none" />
        )}

        {/* Center Assistive Touch Icon */}
        <div className="relative z-10 text-white flex items-center justify-center">
          {isPlaying ? (
            <Music className="w-5 h-5 text-pink-400 animate-bounce" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </div>
      </button>
    </div>
  );
};
