'use client';

import { Flame, Moon, Sparkles, Zap } from 'lucide-react';

interface Props {
  score: number;
}

export default function SmashMeter({ score }: Props) {
  const numScore = Number(score) || 0;

  // Tier calculation
  const getTier = (s: number) => {
    if (s >= 14) return { title: 'GOD TIER ASCENDED', color: 'bg-amber-400 text-black border-amber-300', bar: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600', icon: Sparkles };
    if (s >= 9) return { title: 'NUCLEAR THREAT', color: 'bg-pink-600 text-white border-pink-400', bar: 'bg-pink-500', icon: Zap };
    if (s >= 4) return { title: 'CAMPUS HEARTTHROB', color: 'bg-orange-500 text-white border-orange-300', bar: 'bg-orange-500', icon: Flame };
    if (s >= 0) return { title: 'HEATING UP', color: 'bg-yellow-400 text-black border-yellow-200', bar: 'bg-yellow-400', icon: Flame };
    if (s >= -5) return { title: 'LUKEWARM VIBES', color: 'bg-zinc-700 text-zinc-200 border-zinc-500', bar: 'bg-zinc-500', icon: Moon };
    return { title: 'FROZEN NPC', color: 'bg-blue-900 text-blue-200 border-blue-600', bar: 'bg-blue-600', icon: Moon };
  };

  const tier = getTier(numScore);
  const TierIcon = tier.icon;

  // Percentage from -15 (0%) to +15 (100%)
  const percentage = Math.min(Math.max(((numScore + 15) / 30) * 100, 0), 100);

  return (
    <div
      className={`brutal-border px-4 py-2 flex items-center gap-3 select-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${tier.color}`}
    >
      <TierIcon size={18} className="animate-pulse flex-shrink-0" />
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black tracking-widest uppercase opacity-80">SMASH METER</span>
          <span className="font-black font-mono text-base tracking-tight">
            {numScore > 0 ? `+${numScore.toFixed(1)}` : numScore.toFixed(1)}
          </span>
        </div>
        <span className="font-black text-[10px] tracking-wider uppercase leading-none">{tier.title}</span>
      </div>

      {/* Mini Segmented Bar */}
      <div className="w-20 h-2.5 bg-black/40 brutal-border overflow-hidden hidden sm:block">
        <div 
          className={`h-full ${tier.bar} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
