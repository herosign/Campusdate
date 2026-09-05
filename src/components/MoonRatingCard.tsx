'use client';

import { useState } from 'react';
import { submitMoonRating } from '@/app/actions';
import { Sparkles, Check, Flame, Heart } from 'lucide-react';

interface Props {
  ratedUserId: string;
  ratedUsername: string;
  initialRating?: 'FULL' | 'HALF' | 'QUARTER' | null;
  onRatingDone?: () => void;
}

export default function MoonRatingCard({ ratedUserId, ratedUsername, initialRating = null, onRatingDone }: Props) {
  const [selectedMoon, setSelectedMoon] = useState<'FULL' | 'HALF' | 'QUARTER' | null>(initialRating);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(Boolean(initialRating));

  const MOONS = [
    {
      type: 'FULL' as const,
      symbol: '🌕',
      points: '+3.0',
      title: 'FULL MOON',
      subtitle: 'Legendary / Certified Catch',
      color: 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
    },
    {
      type: 'HALF' as const,
      symbol: '🌗',
      points: '+1.5',
      title: 'HALF MOON',
      subtitle: 'Solid Vibe / Decent Game',
      color: 'bg-pink-400 text-white border-pink-300 shadow-md shadow-pink-400/20'
    },
    {
      type: 'QUARTER' as const,
      symbol: '🌘',
      points: '+0.5',
      title: 'QUARTER MOON',
      subtitle: 'Mid / Cold Energy',
      color: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-sm'
    }
  ];

  const handleRate = async () => {
    if (!selectedMoon) return;
    setSubmitting(true);
    try {
      await submitMoonRating(ratedUserId, selectedMoon);
      setSaved(true);
      if (onRatingDone) onRatingDone();
    } catch (e: any) {
      alert(`Rating failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (saved) {
    const current = MOONS.find(m => m.type === selectedMoon);
    return (
      <div className="glass-panel p-5 flex items-center justify-between font-sans text-sm bg-rose-50/50 dark:bg-rose-950/20">
        <div className="flex items-center gap-3 font-medium text-rose-950 dark:text-rose-100">
          <span className="text-xl">{current?.symbol}</span>
          <span>RATED {current?.title}:</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">{current?.points} Smash Score awarded to {ratedUsername}</span>
        </div>
        <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Check size={14} /> LOCKED
        </span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 space-y-5 bg-white/60 dark:bg-zinc-900/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/10 blur-3xl rounded-full pointer-events-none -mr-10 -mt-10" />
      
      <div className="flex justify-between items-center border-b border-rose-100 dark:border-rose-900/30 pb-3 relative z-10">
        <h4 className="text-lg font-bold tracking-wide flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Sparkles size={20} /> COMPULSORY MOON RATING
        </h4>
        <span className="text-[10px] uppercase bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 px-2.5 py-1 rounded-full font-bold">
          REQUIRED
        </span>
      </div>

      <p className="text-sm opacity-80 leading-relaxed relative z-10 text-zinc-700 dark:text-zinc-300">
        Chat protocol concluded with <span className="font-bold text-rose-600 dark:text-rose-400">{ratedUsername}</span>. Rate their vibe to impact their Smash Meter:
      </p>

      {/* Moon Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        {MOONS.map((m) => {
          const isSelected = selectedMoon === m.type;
          return (
            <button
              type="button"
              key={m.type}
              onClick={() => setSelectedMoon(m.type)}
              className={`p-4 text-left rounded-2xl border transition-all ${
                isSelected 
                  ? `${m.color} scale-[1.02] ring-2 ring-rose-300 dark:ring-rose-500` 
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-rose-100 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-500 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{m.symbol}</span>
                <span className={`font-bold text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-rose-50 dark:bg-zinc-700 text-rose-600 dark:text-rose-400'}`}>
                  {m.points}
                </span>
              </div>
              <p className="font-bold text-sm tracking-tight">{m.title}</p>
              <p className={`text-xs mt-1 leading-tight ${isSelected ? 'opacity-90' : 'opacity-70'}`}>{m.subtitle}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleRate}
        disabled={!selectedMoon || submitting}
        className="brutal-button w-full mt-2 flex items-center justify-center gap-2 relative z-10"
      >
        <Flame size={18} />
        {submitting ? 'LOCKING RATING...' : 'LOCK MOON RATING'}
      </button>
    </div>
  );
}
