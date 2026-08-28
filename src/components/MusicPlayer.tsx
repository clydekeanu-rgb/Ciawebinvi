import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sparkles, Disc } from 'lucide-react';
import { audioEngine } from '../utils/audioSynth';
import { availableMusicTracks } from '../data/partyData';
import { MusicTrackId } from '../types';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrackId>('zootopia-try-everything');
  const [showTrackList, setShowTrackList] = useState(false);

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

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stopMusic();
    } else {
      audioEngine.startMusic(selectedTrack === 'zootopia-try-everything' ? 'zootopia' : 'gabby');
    }
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
  };

  const handleSelectTrack = (trackId: MusicTrackId) => {
    setSelectedTrack(trackId);
    setShowTrackList(false);
    audioEngine.stopMusic();
    audioEngine.startMusic(trackId === 'zootopia-try-everything' ? 'zootopia' : 'gabby');
  };

  const currentTrackData = availableMusicTracks.find(t => t.id === selectedTrack) || availableMusicTracks[0];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Track Selector Popup */}
      {showTrackList && (
        <div className="w-72 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border-2 border-pink-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-100">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-pink-500 animate-spin" />
              Party Music Jukebox
            </span>
            <button
              onClick={() => setShowTrackList(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            {availableMusicTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between text-xs ${
                  selectedTrack === track.id
                    ? 'bg-pink-100 text-pink-900 font-bold border border-pink-300'
                    : 'hover:bg-pink-50 text-slate-700 font-medium'
                }`}
              >
                <div>
                  <p className="truncate">{track.title}</p>
                  <p className="text-[10px] text-slate-500 font-normal">{track.movieOrShow}</p>
                </div>
                {selectedTrack === track.id && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Volume slider in dropdown */}
          <div className="mt-3 pt-2 border-t border-pink-100 flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="text-slate-600 hover:text-pink-600 p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-pink-500" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>
      )}

      {/* Main Floating Floating Widget */}
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-xl border-2 border-pink-200 hover:border-pink-300 transition-all">
        {/* Play/Pause Button */}
        <button
          id="music-play-pause-btn"
          onClick={handleTogglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 shadow-md ${
            isPlaying
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 ring-2 ring-pink-300'
              : 'bg-gradient-to-r from-slate-400 to-slate-500'
          }`}
          title={isPlaying ? 'Pause Music' : 'Play Zootopia 2 Party Song'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        {/* Track info & Equalizer button */}
        <button
          onClick={() => setShowTrackList(!showTrackList)}
          className="flex items-center gap-2 text-left cursor-pointer group"
          title="Change Music Track"
        >
          <div className="max-w-[130px] sm:max-w-[160px]">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-800 truncate group-hover:text-pink-600 transition-colors">
                {currentTrackData.title}
              </span>
            </div>
            <span className="text-[9px] text-pink-600 block truncate font-medium">
              {isPlaying ? '🎶 Playing Party Music' : 'Tap to customize track'}
            </span>
          </div>

          {/* Equalizer dancing bars */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-4 ml-1">
              <div className="w-1 bg-pink-500 rounded-full animate-[bounce_0.6s_infinite_ease-in-out_alternate] h-3"></div>
              <div className="w-1 bg-purple-500 rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.2s_alternate] h-4"></div>
              <div className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.5s_infinite_ease-in-out_0.4s_alternate] h-2.5"></div>
            </div>
          )}
        </button>

        {/* Quick Mute Toggle */}
        <button
          id="music-mute-btn"
          onClick={handleToggleMute}
          className="p-1.5 text-slate-500 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors ml-0.5"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-pink-500" />
          )}
        </button>
      </div>
    </div>
  );
};
