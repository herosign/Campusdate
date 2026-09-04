'use client';

import { useState } from 'react';
import { submitMoonRating } from '@/app/actions';
import { Sparkles, Check, Flame } from 'lucide-react';

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
      color: 'bg-yellow-400 text-black border-yellow-500 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]'
    },
    {
      type: 'HALF' as const,
      symbol: '🌗',
      points: '+1.5',
      title: 'HALF MOON',
      subtitle: 'Solid Vibe / Decent Game',
      color: 'bg-orange-400 text-black border-orange-500 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]'
    },
    {
      type: 'QUARTER' as const,
      symbol: '🌘',
      points: '+0.5',
      title: 'QUARTER MOON',
      subtitle: 'Mid / Cold Energy',
      color: 'bg-zinc-700 text-white border-zinc-500 shadow-[4px_4px_0px_0px_rgba(113,113,122,1)]'
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
      <div className="brutal-border p-4 bg-foreground text-background flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 font-bold">
          <span>{current?.symbol} RATED {current?.title}:</span>
          <span className="text-yellow-400">{current?.points} Smash Score awarded to {ratedUsername}</span>
        </div>
        <span className="bg-background text-foreground px-2 py-0.5 font-bold flex items-center gap-1">
          <Check size={12} /> LOCKED
        </span>
      </div>
    );
  }

  return (
    <div className="brutal-border p-6 bg-black text-white space-y-4 border-4 border-yellow-400 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
      <div className="flex justify-between items-center border-b-2 border-yellow-400/40 pb-2">
        <h4 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 text-yellow-400">
          <Sparkles size={20} /> COMPULSORY MOON RATING
        </h4>
        <span className="font-mono text-[10px] uppercase bg-yellow-400 text-black px-2 py-0.5 font-black">
          REQUIRED
        </span>
      </div>

      <p className="font-mono text-xs opacity-80 leading-relaxed">
        Chat protocol concluded with <span className="font-bold text-white">{ratedUsername}</span>. Rate their vibe to impact their Smash Meter:
      </p>

      {/* Moon Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MOONS.map((m) => {
          const isSelected = selectedMoon === m.type;
          return (
            <button
              type="button"
              key={m.type}
              onClick={() => setSelectedMoon(m.type)}
              className={`p-3 text-left brutal-border transition-all ${
                isSelected 
                  ? `${m.color} scale-[1.02] ring-2 ring-white` 
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-2xl">{m.symbol}</span>
                <span className={`font-mono text-xs font-black px-1.5 py-0.5 brutal-border ${isSelected ? 'bg-black text-white' : 'bg-zinc-800 text-yellow-400'}`}>
                  {m.points}
                </span>
              </div>
              <p className="font-black font-mono text-xs uppercase tracking-tight">{m.title}</p>
              <p className="font-mono text-[10px] opacity-75 mt-0.5 leading-tight">{m.subtitle}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleRate}
        disabled={!selectedMoon || submitting}
        className="brutal-button w-full mt-2 bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-40 flex items-center justify-center gap-2 font-black tracking-wider"
      >
        <Flame size={16} />
        {submitting ? 'LOCKING RATING...' : 'LOCK MOON RATING'}
      </button>
    </div>
  );
}
