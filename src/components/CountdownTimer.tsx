import React, { useState, useEffect } from 'react';
import { Clock, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CountdownTimerProps {
  targetDateIso: string;
  celebrantName: string;
  celebrantAge: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPartyTime: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDateIso,
  celebrantName,
  celebrantAge
}) => {
  const calculateTimeLeft = (): TimeLeft => {
    const target = new Date(targetDateIso).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPartyTime: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isPartyTime: false };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateIso]);

  const celebrateNow = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const timeUnits = [
    { label: 'Days', value: timeLeft.days, color: 'from-pink-500 to-rose-400' },
    { label: 'Hours', value: timeLeft.hours, color: 'from-purple-500 to-fuchsia-400' },
    { label: 'Minutes', value: timeLeft.minutes, color: 'from-cyan-500 to-teal-400' },
    { label: 'Seconds', value: timeLeft.seconds, color: 'from-amber-400 to-yellow-400' },
  ];

  return (
    <section id="countdown-section" className="px-4 py-3 max-w-md lg:max-w-none mx-auto">
      <div className="bg-white/95 rounded-3xl p-5 shadow-xl border-2 border-pink-200 dollhouse-stripes relative overflow-hidden">
        {/* 
          CELESTINE TIARA IMAGE (Background Layer z-0):
          - Positioned in top-right with object-contain so her head, eyes, nose, and tiara 
            sit entirely ABOVE the countdown boxes.
          - Only her shoulders & dress extend down behind the 3rd & 4th white boxes.
        */}
        <div className="absolute right-1 top-1 h-[80%] w-1/2 sm:w-[48%] pointer-events-none z-0 flex justify-end items-start overflow-hidden">
          <img
            src="/celestine_tiara.png"
            alt={celebrantName}
            className="h-full w-auto object-contain object-right-top opacity-100 filter contrast-105 saturate-105 drop-shadow-md"
          />
        </div>

        {/* Foreground Content (z-10 relative) */}
        <div className="relative z-10">
          {/* Header on Left side - max-w-[48%] so title NEVER covers Celestine's face */}
          <div className="flex items-start justify-between mb-16 max-w-[48%] sm:max-w-[52%]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 shadow-xs shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold font-heading text-slate-800 uppercase tracking-wider leading-tight">
                  Party Countdown
                </h2>
                <p className="text-[10px] text-pink-600 font-semibold leading-tight mt-0.5">
                  Until celebration!
                </p>
              </div>
            </div>
          </div>

          {/* Live Numbers Grid - Placed below Celestine's face so her eyes/tiara are 100% visible */}
          {!timeLeft.isPartyTime ? (
            <div className="grid grid-cols-4 gap-2 text-center my-3">
              {timeUnits.map((unit) => (
                <div
                  key={unit.label}
                  className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border-2 border-pink-200/90 flex flex-col items-center justify-center transition-all hover:scale-105"
                >
                  <div className={`text-2xl sm:text-3xl font-extrabold font-heading bg-gradient-to-br ${unit.color} bg-clip-text text-transparent leading-none`}>
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl border border-pink-300 my-4">
              <div className="text-3xl mb-1">🎉 🐱 ✨</div>
              <h3 className="text-lg font-extrabold text-pink-600">
                It&apos;s Party Time!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Celebrating {celebrantName}&apos;s {celebrantAge}rd Birthday today!
              </p>
              <button
                onClick={celebrateNow}
                className="mt-2.5 px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-full shadow transition-all cursor-pointer"
              >
                Pop More Confetti! 🎊
              </button>
            </div>
          )}

          {/* Motivational cheer footer */}
          <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1 font-medium text-[11px]">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-400" />
              Counting down every second with you!
            </span>
            <button
              onClick={celebrateNow}
              className="text-[11px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 transition-colors cursor-pointer"
              title="Pop confetti!"
            >
              #CelestineTurns3 ✨
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
