'use client';

import { useState, useEffect } from 'react';
import { Trophy, X, Sparkles, Flame, Zap, Moon, Crown, Medal, RefreshCw, UserCheck } from 'lucide-react';
import { getSmashLeaderboard, LeaderboardEntry } from '@/app/actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const getSmashTier = (s: number) => {
  if (s >= 14) return { title: 'GOD TIER ASCENDED', color: 'bg-amber-400 text-black border-amber-300', bar: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600', icon: Sparkles };
  if (s >= 9) return { title: 'NUCLEAR THREAT', color: 'bg-pink-600 text-white border-pink-400', bar: 'bg-pink-500', icon: Zap };
  if (s >= 4) return { title: 'CAMPUS HEARTTHROB', color: 'bg-orange-500 text-white border-orange-300', bar: 'bg-orange-500', icon: Flame };
  if (s >= 0) return { title: 'HEATING UP', color: 'bg-yellow-400 text-black border-yellow-200', bar: 'bg-yellow-400', icon: Flame };
  if (s >= -5) return { title: 'LUKEWARM VIBES', color: 'bg-zinc-700 text-zinc-200 border-zinc-500', bar: 'bg-zinc-500', icon: Moon };
  return { title: 'FROZEN NPC', color: 'bg-blue-900 text-blue-200 border-blue-600', bar: 'bg-blue-600', icon: Moon };
};

export default function SmashLeaderboardModal({ isOpen, onClose, currentUserId }: Props) {
  const [loading, setLoading] = useState(true);
  const [top10, setTop10] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [isCurrentUserInTop10, setIsCurrentUserInTop10] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded bg-yellow-400 text-black font-black text-sm border-2 border-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Crown size={18} className="fill-black" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-300 text-black font-black text-sm border-2 border-zinc-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Medal size={18} className="fill-zinc-600" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-700 text-white font-black text-sm border-2 border-amber-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Medal size={18} className="fill-amber-300" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-foreground/10 text-foreground font-mono font-black text-xs border border-foreground/30">
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
        className={`p-3 sm:p-4 flex items-center justify-between gap-3 brutal-border transition-all ${
          isSelf
            ? 'bg-yellow-400/20 border-yellow-400 dark:bg-yellow-400/10'
            : isTop3
            ? 'bg-foreground/[0.04]'
            : 'bg-background'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {renderRankBadge(entry.rank)}

          {/* Avatar */}
          <div className="relative w-10 h-10 flex-shrink-0 bg-zinc-800 brutal-border overflow-hidden flex items-center justify-center text-white font-black text-sm">
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
              <span className="font-black text-sm sm:text-base uppercase tracking-tight truncate">
                {entry.username}
              </span>
              {isSelf && (
                <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 border border-black uppercase flex items-center gap-1">
                  <UserCheck size={10} /> YOU
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono opacity-75 truncate">
              {entry.gender && (
                <span className={entry.gender === 'Male' ? 'text-blue-500 font-bold' : 'text-pink-500 font-bold'}>
                  {entry.gender}
                </span>
              )}
              {entry.college && (
                <>
                  <span>•</span>
                  <span>{entry.college}</span>
                </>
              )}
              {entry.branch && (
                <>
                  <span>•</span>
                  <span>{entry.branch}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Score & Tier */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="font-mono font-black text-base sm:text-lg tracking-tight">
            {entry.smash_meter_score > 0
              ? `+${entry.smash_meter_score.toFixed(1)}`
              : entry.smash_meter_score.toFixed(1)}
          </span>
          <span
            className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-none border border-black/30 dark:border-white/30 flex items-center gap-1 ${tier.color}`}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="brutal-glass max-w-2xl w-full max-h-[90vh] flex flex-col border-4 border-foreground shadow-[8px_8px_0px_0px] relative bg-background">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-4 border-foreground flex justify-between items-start bg-foreground text-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                SMASH METER LEADERBOARD
              </h2>
              <p className="font-mono text-xs opacity-80">
                CAMPUS RANKINGS • {totalUsers > 0 ? `${totalUsers} ACTIVE PROFILES` : 'REAL-TIME'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="p-2 hover:bg-background hover:text-foreground transition-colors border border-background cursor-pointer"
              title="Refresh Leaderboard"
              aria-label="Refresh Leaderboard"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background hover:text-foreground transition-colors border border-background font-black cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="space-y-3 py-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 brutal-border bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-red-500 font-bold">{error}</p>
              <button onClick={fetchLeaderboard} className="brutal-button text-xs py-1 px-3">
                TRY AGAIN
              </button>
            </div>
          ) : top10.length === 0 ? (
            <div className="text-center py-12 font-mono opacity-60">
              NO LEADERBOARD DATA YET. BE THE FIRST TO RANK!
            </div>
          ) : (
            <>
              {/* Top 10 Heading */}
              <div className="flex items-center justify-between pb-1">
                <span className="font-mono text-xs font-black uppercase tracking-widest opacity-60">
                  TOP 10 CAMPUS ELITE
                </span>
                {currentUserEntry && (
                  <span className="font-mono text-xs font-bold text-yellow-500">
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
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 flex-1 bg-foreground/20" />
                    <span className="font-mono text-xs font-black uppercase tracking-widest px-2 py-0.5 bg-foreground text-background">
                      YOUR STANDING
                    </span>
                    <div className="h-0.5 flex-1 bg-foreground/20" />
                  </div>

                  {renderRow(currentUserEntry, true)}

                  <p className="font-mono text-xs text-center opacity-70 pt-1">
                    ⚡ You are <span className="font-bold text-foreground">#{currentUserEntry.rank}</span> out of {totalUsers} users. Boost your score via referrals and mutual chat ratings to break into the Top 10!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-foreground bg-foreground/5 flex justify-between items-center text-xs font-mono">
          <span className="opacity-70">Updated live from campus vibe checks</span>
          <button
            onClick={onClose}
            className="brutal-button text-xs py-1.5 px-4"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
