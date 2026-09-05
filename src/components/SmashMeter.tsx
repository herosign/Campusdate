'use client';

import { useState } from 'react';
import { Flame, Moon, Sparkles, Zap, Trophy, ChevronRight, Heart } from 'lucide-react';
import SmashLeaderboardModal, { getSmashTier } from './SmashLeaderboardModal';
import { useUITheme } from '@/context/ThemeContext';

interface Props {
  score: number;
  userId?: string;
  fullWidth?: boolean;
}

export default function SmashMeter({ score, userId, fullWidth = false }: Props) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const { uiTheme } = useUITheme();
  const numScore = Number(score) || 0;

  const tier = getSmashTier(numScore);
  const TierIcon = tier.icon;

  // Percentage from -15 (0%) to +15 (100%)
  const percentage = Math.min(Math.max(((numScore + 15) / 30) * 100, 0), 100);

  return (
    <>
      <div className={`relative group ${fullWidth ? 'block w-full md:w-auto' : 'inline-block'}`}>
        <button
          type="button"
          onClick={() => setIsLeaderboardOpen(true)}
          className={
            uiTheme === 'neo-brutal'
              ? `flex items-center select-none transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer text-left bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                  fullWidth ? 'w-full px-4 py-2 sm:px-6 sm:py-2.5 gap-4 justify-between' : 'px-4 py-2.5 gap-3'
                }`
              : `brutal-border flex items-center select-none transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer text-left ${tier.color} hover:shadow-lg hover:shadow-rose-500/30 ${
                  fullWidth 
                    ? 'w-full px-4 py-3 sm:px-8 sm:py-5 rounded-3xl gap-3 sm:gap-6 border-2 border-white/40 bg-opacity-90 backdrop-blur-md shadow-md hover:shadow-xl flex-wrap sm:flex-nowrap justify-between' 
                    : 'px-4 py-2.5 gap-3'
                }`
          }
          title="Click to view Smash Meter Leaderboard"
          aria-label="Smash Meter Score and Leaderboard"
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <TierIcon size={fullWidth ? (uiTheme === 'neo-brutal' ? 24 : 28) : 20} className={uiTheme === 'neo-brutal' ? "" : "animate-pulse"} />
              {uiTheme === 'romantic' && (
                <span className={`absolute -bottom-1 -right-1 text-rose-500 bg-white rounded-full font-black shadow-sm ${fullWidth ? 'p-0.5' : 'p-0.5 text-[10px]'}`}>
                  <Heart size={fullWidth ? 12 : 10} fill="currentColor" />
                </span>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-mono font-bold tracking-widest uppercase ${uiTheme === 'neo-brutal' ? 'text-[10px]' : (fullWidth ? 'text-xs sm:text-sm opacity-80' : 'text-xs opacity-80')}`}>
                  SMASH METER
                </span>
                <span className={`font-black tracking-tight ${uiTheme === 'neo-brutal' ? 'text-base' : (fullWidth ? 'text-xl sm:text-3xl text-white drop-shadow-sm' : 'text-base')}`}>
                  {numScore > 0 ? `+${numScore.toFixed(1)}` : numScore.toFixed(1)}
                </span>
              </div>
              <span className={`font-black tracking-wider uppercase leading-none opacity-90 ${uiTheme === 'neo-brutal' ? 'text-[9px]' : (fullWidth ? 'text-[10px] sm:text-sm' : 'text-[10.5px]')}`}>
                {tier.title}
              </span>
            </div>

            {/* Progress Bar — hidden on mobile when fullWidth */}
            <div className={
              uiTheme === 'neo-brutal'
                ? `h-3 bg-white border-2 border-black overflow-hidden hidden sm:block ${fullWidth ? 'w-24 ml-2' : 'w-16'}`
                : `h-2.5 bg-white/20 rounded-full overflow-hidden border border-white/30 hidden sm:block ${fullWidth ? 'flex-1 max-w-xs ml-4' : 'w-16 sm:w-20'}`
            }>
              <div
                className={uiTheme === 'neo-brutal' ? `h-full bg-purple-600 transition-all duration-500` : `h-full ${tier.bar || 'bg-rose-400'} transition-all duration-500 rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Mobile progress bar for fullWidth */}
          {fullWidth && (
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden border border-white/30 sm:hidden">
              <div
                className={`h-full ${tier.bar || 'bg-rose-400'} transition-all duration-500 rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}

          <div className={uiTheme === 'neo-brutal' ? `border-l-2 border-black pl-3 sm:pl-4 hidden sm:flex items-center font-bold uppercase gap-1.5 sm:gap-2 flex-shrink-0 text-[10px] text-black` : `border-l border-white/30 pl-3 sm:pl-4 hidden sm:flex items-center font-bold uppercase transition-opacity gap-1.5 sm:gap-2 flex-shrink-0 ${fullWidth ? 'text-xs sm:text-sm opacity-90 group-hover:opacity-100' : 'text-[10px] opacity-70 group-hover:opacity-100'}`}>
            {uiTheme !== 'neo-brutal' && <Trophy size={fullWidth ? 16 : 14} className="text-white/80" />}
            <span>TOP 10</span>
            <ChevronRight size={fullWidth ? (uiTheme === 'neo-brutal' ? 14 : 16) : 14} className={uiTheme === 'neo-brutal' ? "text-black" : "text-white/80"} />
          </div>

          {/* Mobile CTA */}
          {fullWidth && (
            <div className={`flex sm:hidden items-center gap-1.5 text-[10px] font-bold uppercase opacity-80 mt-1 ${uiTheme === 'neo-brutal' ? 'text-black' : ''}`}>
              <Trophy size={12} className={uiTheme === 'neo-brutal' ? "text-black" : "text-white/80"} />
              <span>Tap for Leaderboard</span>
              <ChevronRight size={12} className={uiTheme === 'neo-brutal' ? "text-black" : "text-white/80"} />
            </div>
          )}
        </button>

        {/* Hover Tooltip — z-[60] to sit above the z-50 header */}
        <div className={`absolute left-1/2 -translate-x-1/2 hidden group-hover:block z-[60] pointer-events-none whitespace-nowrap animate-in fade-in duration-150 ${fullWidth ? 'bottom-full mb-3' : 'top-full mt-2'}`}>
          <div className="bg-zinc-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-zinc-700">
            <Trophy size={12} className="text-amber-400" />
            <span>Click to view Smash Meter Leaderboard & your rank</span>
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
