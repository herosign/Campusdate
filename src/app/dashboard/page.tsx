import { getMatches, initiateMatch } from '@/app/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { UserPlus, Settings, Users, Heart } from 'lucide-react';
import Link from 'next/link';
import InitiateButton from '@/components/InitiateButton';
import InstaPromptModal from '@/components/InstaPromptModal';
import TagsPromptModal from '@/components/TagsPromptModal';
import AcademicPromptModal from '@/components/AcademicPromptModal';
import SmashMeter from '@/components/SmashMeter';
import LogoutButton from '@/components/LogoutButton';
import TutorialButton from '@/components/TutorialButton';
import ThemeToggle from '@/components/ThemeToggle';
import { useUITheme } from '@/context/ThemeContext';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  
  if (!profile) {
    redirect('/onboarding');
  }

  const potentialMatches = await getMatches();
  
  // Enrich potential matches with full profile data and matrix tags
  const matchIds = potentialMatches.map((pm: any) => pm.profile_id);
  const [{ data: fullProfiles }, { data: allMatchProfileTags }] = await Promise.all([
    supabase.from('profiles').select('*').in('id', matchIds),
    supabase.from('profile_tags').select('profile_id, tags(id, tag_name, category)').in('profile_id', matchIds)
  ]);

  const targetGender = profile.gender === 'Male' ? 'Female' : profile.gender === 'Female' ? 'Male' : null;

  const enrichedMatches = potentialMatches
    .map((pm: any) => {
      const fullProfile = fullProfiles?.find(fp => fp.id === pm.profile_id);
      const userTags = (allMatchProfileTags || [])
        .filter((pt: any) => pt.profile_id === pm.profile_id)
        .map((pt: any) => pt.tags)
        .filter(Boolean);
      return { ...pm, ...fullProfile, tags: userTags };
    })
    .filter((pm: any) => {
      if (!targetGender) return true;
      return pm.gender === targetGender;
    });
  
  // Also fetch active matches for the chat list
  const { data: activeMatches } = await supabase
    .from('matches')
    .select('*, user1:profiles!user1_id(id, username), user2:profiles!user2_id(id, username)')
    .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`);

  // Check if user has any tags saved
  const { count: tagCount } = await supabase
    .from('profile_tags')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user!.id);

  const hasTags = (tagCount ?? 0) > 0;
  const hasAcademicDetails = Boolean(profile.gender && profile.college && profile.branch && profile.year);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-10">

      {/* 1. Show academic & gender prompt if missing (Mandatory) */}
      {!hasAcademicDetails && <AcademicPromptModal userId={user!.id} />}

      {/* 2. Show tags prompt if user has no tags (Mandatory for algorithm) */}
      {hasAcademicDetails && !hasTags && <TagsPromptModal userId={user!.id} />}

      {/* 3. Show Instagram prompt if handle is missing */}
      {hasAcademicDetails && hasTags && !profile.instagram_handle && <InstaPromptModal userId={user!.id} />}

      {/* Header Container */}
      <div className="mb-8">
        <header className="theme-dashboard-header relative z-50 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-4 border-foreground">
          
          {/* Logo Section */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
              CAMPUS DATE <span className="opacity-50">//</span>
            </h1>
            <p className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-400 dark:text-zinc-500 uppercase leading-none mt-1">
              {profile.username}
            </p>
          </div>
          
          {/* Controls Section */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0 w-full md:w-auto">
            <div className="flex flex-wrap justify-end items-center gap-2">
              <ThemeToggle />
              <TutorialButton />
              <Link href="/profile" className="theme-btn-black flex items-center gap-2 text-xs sm:text-sm font-bold uppercase px-4 py-2">
                <Settings size={14} /> EDIT PROFILE
              </Link>
            </div>
            <div className="flex flex-wrap justify-end items-center gap-2 w-full md:w-auto mt-1">
              <SmashMeter score={profile.smash_meter_score} userId={user.id} />
              <LogoutButton />
            </div>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        
        {/* Active Chats */}
        <div className="lg:col-span-1 space-y-5">
          <h2 className="theme-header text-xl font-bold tracking-tight bg-gradient-to-r from-rose-500 to-pink-500 text-white inline-block px-5 py-1.5 rounded-full shadow-sm">
            Active Links
          </h2>
          <div className="flex flex-col gap-3">
            {activeMatches?.length === 0 && (
              <div className="glass-panel p-6 text-center text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                No active connections yet.
              </div>
            )}
            {activeMatches?.map((match: any) => {
              const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
              return (
                <Link key={match.id} href={`/chat/${match.id}`} className="glass-panel p-4 hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-700 transition-all flex justify-between items-center group hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className="theme-icon-bg w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                      {otherUser.username.slice(0,2).toUpperCase()}
                    </div>
                    <span className="font-bold tracking-tight text-foreground">{otherUser.username}</span>
                  </div>
                  <span className="theme-badge text-xs font-bold text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    {match.message_count}/50 MSG
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Potential Matches */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="theme-header text-xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white inline-block px-5 py-1.5 rounded-full shadow-sm uppercase">
            Algorithm Recommends
          </h2>
          {enrichedMatches.length === 0 ? (
            <div className="glass-panel p-8 sm:p-12 text-center space-y-6 border-2 border-dashed border-rose-200 dark:border-rose-900/50">
              <div className="inline-flex p-5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 shadow-sm">
                <Heart size={36} className="animate-pulse" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight text-foreground">NO MATCHES CURRENTLY FOUND</h3>
                <p className="text-sm max-w-lg mx-auto text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {profile.gender === 'Male' && "Scanning exclusively for Female profiles across JAC Delhi campuses. No new profiles available right now."}
                  {profile.gender === 'Female' && "Scanning exclusively for Male profiles across JAC Delhi campuses. No new profiles available right now."}
                  {profile.gender !== 'Male' && profile.gender !== 'Female' && "No new profiles matching your matrix tags right now."}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-900/60 max-w-md mx-auto text-sm text-left space-y-2 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800 shadow-inner">
                <p className="font-bold text-rose-500 mb-3 tracking-wide">💡 SYSTEM ADVISORY</p>
                <p className="flex items-start gap-2"><span className="text-rose-400 mt-0.5">•</span> Check back as more students complete onboarding.</p>
                <p className="flex items-start gap-2"><span className="text-rose-400 mt-0.5">•</span> Invite campus classmates to expand your matrix pool.</p>
                <p className="flex items-start gap-2"><span className="text-rose-400 mt-0.5">•</span> Each referral boosts your Smash Meter score (+1 point).</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {enrichedMatches.map((pm: any) => (
              <div key={pm.profile_id} className="glass-panel p-6 flex flex-col gap-4 group hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-300">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black truncate text-foreground">{pm.username}</h3>
                    {(pm.college || pm.branch || pm.year || pm.gender) && (
                      <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider">
                        {pm.gender && <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 px-2 py-0.5 rounded-full">{pm.gender}</span>}
                        {pm.college && <span className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded-full">{pm.college}</span>}
                        {pm.branch && <span className="border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">{pm.branch}</span>}
                        {pm.year && <span className="border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">{pm.year} Yr</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-wider mb-0.5">Match</span>
                    <span className="theme-badge text-sm font-black px-2.5 py-1 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-xl shadow-sm">
                      {Number(pm.match_score).toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm border-l-2 border-fuchsia-400 pl-4 py-1 italic text-zinc-700 dark:text-zinc-300 flex-1 relative">
                  <span className="text-4xl text-fuchsia-200 dark:text-fuchsia-900 absolute -top-2 -left-2 -z-10 font-serif">"</span>
                  {pm.bio}
                </p>
                
                {pm.photo_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={pm.photo_url} alt={pm.username} className="w-full h-56 object-cover rounded-2xl shadow-sm mt-2 border-2 border-white dark:border-zinc-800 group-hover:scale-[1.02] transition-transform duration-300" />
                )}

                <div className="space-y-2 mt-2 text-xs text-zinc-600 dark:text-zinc-400 border-t border-fuchsia-100 dark:border-zinc-800 pt-4">
                  {pm.quote && <p className="truncate" title={pm.quote}><span className="font-bold text-fuchsia-500 mr-2">QUOTE</span> {pm.quote}</p>}
                  {pm.movie && <p className="truncate" title={pm.movie}><span className="font-bold text-fuchsia-500 mr-2">MOVIE</span> {pm.movie}</p>}
                  {pm.music && <p className="truncate" title={pm.music}><span className="font-bold text-fuchsia-500 mr-2">MUSIC</span> {pm.music}</p>}
                  {pm.hobbies && pm.hobbies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="font-bold text-fuchsia-500 mr-1 self-center text-[10px] uppercase">HOBBIES</span>
                      {pm.hobbies.map((h: string) => (
                        <span key={h} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full text-[10px] font-medium">{h}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <InitiateButton profileId={pm.profile_id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
