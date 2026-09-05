'use client';

import { useState } from 'react';
import { Flame, Moon, Sparkles, Zap, Trophy, ChevronRight } from 'lucide-react';
import SmashLeaderboardModal, { getSmashTier } from './SmashLeaderboardModal';

interface Props {
  score: number;
  userId?: string;
}

export default function SmashMeter({ score, userId }: Props) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const numScore = Number(score) || 0;

  const tier = getSmashTier(numScore);
  const TierIcon = tier.icon;

  // Percentage from -15 (0%) to +15 (100%)
  const percentage = Math.min(Math.max(((numScore + 15) / 30) * 100, 0), 100);

  return (
    <>
      <div className="relative inline-block group">
        <button
          type="button"
          onClick={() => setIsLeaderboardOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`brutal-border px-3.5 py-2 flex items-center gap-3 select-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer text-left ${tier.color}`}
          title="Click to view Smash Meter Leaderboard"
          aria-label="Smash Meter Score and Leaderboard"
        >
          <div className="relative">
            <TierIcon size={18} className="animate-pulse flex-shrink-0" />
            <span className="absolute -bottom-1 -right-1 text-[8px] bg-black text-yellow-400 rounded-full px-0.5 font-black">
              🏆
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-widest uppercase opacity-80 flex items-center gap-1">
                SMASH METER
              </span>
              <span className="font-black font-mono text-base tracking-tight">
                {numScore > 0 ? `+${numScore.toFixed(1)}` : numScore.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-[10px] tracking-wider uppercase leading-none">
                {tier.title}
              </span>
            </div>
          </div>

          {/* Mini Segmented Bar */}
          <div className="w-16 sm:w-20 h-2.5 bg-black/40 brutal-border overflow-hidden hidden sm:block">
            <div
              className={`h-full ${tier.bar || 'bg-yellow-400'} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="border-l-2 border-black/20 dark:border-white/20 pl-2 hidden md:flex items-center text-[10px] font-mono font-black uppercase opacity-70 group-hover:opacity-100 transition-opacity gap-0.5">
            <Trophy size={12} className="text-yellow-500" />
            <span>TOP 10</span>
            <ChevronRight size={12} />
          </div>
        </button>

        {/* Hover Tooltip on Desktop */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-40 pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
          <div className="bg-foreground text-background text-[11px] font-mono font-bold px-2.5 py-1 brutal-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1.5">
            <Trophy size={12} className="text-yellow-400" />
            <span>Click to view Top 10 Campus Leaderboard & your rank</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      <SmashLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserId={userId}
      />
    </>
  );
}
