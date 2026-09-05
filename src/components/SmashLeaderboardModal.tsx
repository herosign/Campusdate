'use client';

import { useState, useEffect } from 'react';
import { Trophy, X, Sparkles, Flame, Zap, Moon, Crown, Medal, RefreshCw, UserCheck, Heart } from 'lucide-react';
import { getSmashLeaderboard, LeaderboardEntry } from '@/app/actions';
import { useUITheme } from '@/context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const getSmashTier = (s: number) => {
  if (s >= 14) return { title: 'GOD TIER ASCENDED', color: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent', bar: 'bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500', icon: Sparkles };
  if (s >= 9) return { title: 'NUCLEAR THREAT', color: 'bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-transparent', bar: 'bg-gradient-to-r from-fuchsia-400 to-rose-400', icon: Zap };
  if (s >= 4) return { title: 'CAMPUS HEARTTHROB', color: 'bg-gradient-to-r from-orange-400 to-rose-500 text-white border-transparent', bar: 'bg-gradient-to-r from-orange-300 to-rose-400', icon: Heart };
  if (s >= 0) return { title: 'HEATING UP', color: 'bg-gradient-to-r from-amber-300 to-orange-400 text-orange-950 border-transparent', bar: 'bg-gradient-to-r from-amber-200 to-orange-300', icon: Flame };
  if (s >= -5) return { title: 'LUKEWARM VIBES', color: 'bg-zinc-200 text-zinc-700 border-zinc-300', bar: 'bg-zinc-400', icon: Moon };
  return { title: 'FROZEN NPC', color: 'bg-blue-200 text-blue-900 border-blue-300', bar: 'bg-blue-400', icon: Moon };
};

export default function SmashLeaderboardModal({ isOpen, onClose, currentUserId }: Props) {
  const [loading, setLoading] = useState(true);
  const [top10, setTop10] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [isCurrentUserInTop10, setIsCurrentUserInTop10] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { uiTheme } = useUITheme();

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSmashLeaderboard(currentUserId);
      setTop10(data.top10);
      setCurrentUserEntry(data.currentUserEntry);
      setIsCurrentUserInTop10(data.isCurrentUserInTop10);
      setTotalUsers(data.totalUsers);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, currentUserId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderRankBadge = (rank: number) => {
    if (uiTheme === 'neo-brutal') {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-black font-bold text-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          #{rank}
        </div>
      );
    }
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-white font-black text-sm shadow-md">
          <Crown size={16} className="fill-white" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 text-white font-black text-sm shadow-md">
          <Medal size={16} className="fill-white" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white font-black text-sm shadow-md">
          <Medal size={16} className="fill-white" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs shadow-inner">
        #{rank}
      </div>
    );
  };

  const renderRow = (entry: LeaderboardEntry, isSelf: boolean) => {
    const tier = getSmashTier(entry.smash_meter_score);
    const TierIcon = tier.icon;
    const isTop3 = entry.rank <= 3;

    return (
      <div
        key={entry.id}
        className={`p-3 sm:p-4 flex items-center justify-between gap-3 transition-all ${
          uiTheme === 'neo-brutal'
            ? `border-4 border-black text-black ${isSelf ? 'bg-yellow-200' : 'bg-white'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
            : `rounded-2xl border hover:scale-[1.01] ${isSelf ? 'bg-rose-50 border-rose-300 shadow-sm dark:bg-rose-900/20 dark:border-rose-700' : isTop3 ? 'bg-white/80 dark:bg-zinc-800/60 border-zinc-100 shadow-sm' : 'bg-white/50 dark:bg-zinc-900/50 border-transparent'}`
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {renderRankBadge(entry.rank)}

          {/* Avatar */}
          <div className={`relative w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-sm overflow-hidden ${
            uiTheme === 'neo-brutal'
              ? 'bg-black text-white border-2 border-black'
              : 'bg-rose-100 text-rose-800 rounded-full shadow-sm ring-2 ring-white'
          }`}>
            {entry.photo_url ? (
              <img
                src={entry.photo_url}
                alt={entry.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span>{entry.username.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          {/* User Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base tracking-tight truncate text-foreground">
                {entry.username}
              </span>
              {isSelf && (
                <span className={uiTheme === 'neo-brutal' ? "bg-yellow-400 text-black border-2 border-black text-[10px] font-bold px-2 py-0.5 uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-sm"}>
                  <UserCheck size={10} /> YOU
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs opacity-75 truncate mt-0.5">
              {entry.gender && (
                <span className={entry.gender === 'Male' ? 'text-blue-500 font-medium' : 'text-pink-500 font-medium'}>
                  {entry.gender}
                </span>
              )}
              {entry.college && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-500">{entry.college}</span>
                </>
              )}
              {entry.branch && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-500">{entry.branch}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Score & Tier */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={uiTheme === 'neo-brutal' ? "font-bold text-base sm:text-lg tracking-tight text-black" : "font-bold text-base sm:text-lg tracking-tight text-rose-600"}>
            {entry.smash_meter_score > 0
              ? `+${entry.smash_meter_score.toFixed(1)}`
              : entry.smash_meter_score.toFixed(1)}
          </span>
          <span
            className={uiTheme === 'neo-brutal' ? `text-[9px] sm:text-[10px] font-bold px-2 py-0.5 border-2 border-black bg-orange-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1` : `text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30 shadow-sm flex items-center gap-1 ${tier.color}`}
          >
            <TierIcon size={10} />
            <span className="hidden sm:inline">{tier.title}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={uiTheme === 'neo-brutal' ? "w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "glass-panel w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden bg-white/90 dark:bg-zinc-950/90 text-foreground"}>
        
        {/* Header */}
        <div className={uiTheme === 'neo-brutal' ? "p-5 sm:p-6 bg-black text-white flex justify-between items-start border-b-4 border-black" : "p-5 sm:p-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white flex justify-between items-start rounded-t-3xl"}>
          <div className="flex items-center gap-4">
            <div className={uiTheme === 'neo-brutal' ? "p-3 bg-yellow-400 text-black border-2 border-black" : "p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30 text-white"}>
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 uppercase">
                SMASH METER LEADERBOARD
              </h2>
              <p className={uiTheme === 'neo-brutal' ? "text-xs text-yellow-400 font-bold mt-0.5 uppercase tracking-widest" : "text-xs text-rose-100 font-medium opacity-90 mt-0.5"}>
                CAMPUS RANKINGS • {totalUsers > 0 ? `${totalUsers} ACTIVE PROFILES` : 'REAL-TIME'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="p-2.5 rounded-full hover:bg-white/20 transition-colors text-white"
              title="Refresh Leaderboard"
              aria-label="Refresh Leaderboard"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-white/20 transition-colors text-white"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="space-y-3 py-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-rose-100/50 dark:bg-rose-900/10 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-4">
              <p className="text-rose-500 font-bold">{error}</p>
              <button onClick={fetchLeaderboard} className="brutal-button text-sm py-2 px-6">
                TRY AGAIN
              </button>
            </div>
          ) : top10.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 font-medium">
              NO LEADERBOARD DATA YET. BE THE FIRST TO RANK!
            </div>
          ) : (
            <>
              {/* Top 10 Heading */}
              <div className="flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400/80">
                  TOP 10 CAMPUS ELITE
                </span>
                {currentUserEntry && (
                  <span className="text-xs font-bold text-rose-500">
                    YOUR RANK: #{currentUserEntry.rank}
                  </span>
                )}
              </div>

              {/* Top 10 Entries */}
              <div className="space-y-2.5">
                {top10.map((entry) => renderRow(entry, entry.id === currentUserId))}
              </div>

              {/* If user is NOT in the top 10, display their standing below */}
              {!isCurrentUserInTop10 && currentUserEntry && (
                <div className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-200" />
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-rose-100 text-rose-600 rounded-full">
                      YOUR STANDING
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-200" />
                  </div>

                  {renderRow(currentUserEntry, true)}

                  <p className="text-xs text-center text-zinc-500 pt-2">
                    ✨ You are <span className="font-bold text-rose-600">#{currentUserEntry.rank}</span> out of {totalUsers} users. Keep chatting and getting positive vibes to climb up!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={uiTheme === 'neo-brutal' ? "p-5 border-t-4 border-black bg-white flex justify-between items-center" : "p-5 border-t border-rose-100/50 bg-rose-50/50 dark:bg-zinc-900/50 flex justify-between items-center rounded-b-3xl"}>
          <span className={uiTheme === 'neo-brutal' ? "text-xs text-black font-mono font-bold flex items-center gap-1.5" : "text-xs text-zinc-400 font-medium flex items-center gap-1.5"}>
            <Heart size={12} className={uiTheme === 'neo-brutal' ? "text-black" : "text-rose-400"} /> Updated live from campus smash meter ratings
          </span>
          <button
            onClick={onClose}
            className={uiTheme === 'neo-brutal' ? "brutal-button px-6 py-2" : "px-6 py-2 rounded-full font-bold text-sm bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition-colors"}
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
