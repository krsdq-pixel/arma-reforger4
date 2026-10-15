import React, { useState, useEffect, useRef } from 'react';
import { TranslationKeys } from '../../localization/en';
import { soundManager } from '../../utils/audio';
import { Play, RotateCcw, Flame, CheckCircle } from 'lucide-react';

interface SplashCountdownProps {
  tofSeconds: number | null;
  t: TranslationKeys;
}

export const SplashCountdown: React.FC<SplashCountdownProps> = ({
  tofSeconds,
  t,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const [isSplashed, setIsSplashed] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastWarningRef = useRef<number | null>(null);

  const startTimer = () => {
    if (!tofSeconds || tofSeconds <= 0) return;
    setIsRunning(true);
    setIsSplashed(false);
    setRemaining(tofSeconds);
    lastWarningRef.current = null;
    soundManager.playRoundOut();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsSplashed(false);
    setRemaining(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = 100; // 100ms ticks
    timerRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(0, prev - 0.1);

        // Warning pips at 3, 2, 1 seconds
        const wholeSec = Math.ceil(next);
        if (wholeSec <= 3 && wholeSec >= 1 && lastWarningRef.current !== wholeSec) {
          lastWarningRef.current = wholeSec;
          soundManager.playSplashWarning();
        }

        if (next <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setIsRunning(false);
          setIsSplashed(true);
          soundManager.playSplash();
          return 0;
        }

        return Math.round(next * 10) / 10;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2.5">
        <button
          onClick={isRunning ? resetTimer : startTimer}
          disabled={!tofSeconds}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow ${
            isRunning
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : !tofSeconds
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
          }`}
        >
          {isRunning ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.calculator.resetTimer}</span>
            </>
          ) : (
            <>
              <Flame className="w-3.5 h-3.5" />
              <span>{t.calculator.fireRound}</span>
            </>
          )}
        </button>

        <div className="flex flex-col">
          {isRunning ? (
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-xs text-amber-400 font-semibold">{t.calculator.splashIn}:</span>
              <span className="text-xl font-black text-amber-300">{remaining.toFixed(1)}s</span>
            </div>
          ) : isSplashed ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs animate-bounce">
              <CheckCircle className="w-4 h-4" />
              <span>{t.calculator.splash}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-mono">
              {tofSeconds ? `ETA: ${tofSeconds.toFixed(1)}s` : 'No firing solution'}
            </span>
          )}
        </div>
      </div>

      {isRunning && (
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        </div>
      )}
    </div>
  );
};
