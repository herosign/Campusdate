import { getMatches, initiateMatch } from '@/app/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { UserPlus, Settings } from 'lucide-react';
import Link from 'next/link';
import InitiateButton from '@/components/InitiateButton';
import InstaPromptModal from '@/components/InstaPromptModal';
import TagsPromptModal from '@/components/TagsPromptModal';
import AcademicPromptModal from '@/components/AcademicPromptModal';
import SmashMeter from '@/components/SmashMeter';
import LogoutButton from '@/components/LogoutButton';

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

  const enrichedMatches = potentialMatches.map((pm: any) => {
    const fullProfile = fullProfiles?.find(fp => fp.id === pm.profile_id);
    const userTags = (allMatchProfileTags || [])
      .filter((pt: any) => pt.profile_id === pm.profile_id)
      .map((pt: any) => pt.tags)
      .filter(Boolean);
    return { ...pm, ...fullProfile, tags: userTags };
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
    <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-12">

      {/* 1. Show academic & gender prompt if missing (Mandatory) */}
      {!hasAcademicDetails && <AcademicPromptModal userId={user!.id} />}

      {/* 2. Show tags prompt if user has no tags (Mandatory for algorithm) */}
      {hasAcademicDetails && !hasTags && <TagsPromptModal userId={user!.id} />}

      {/* 3. Show Instagram prompt if handle is missing */}
      {hasAcademicDetails && hasTags && !profile.instagram_handle && <InstaPromptModal userId={user!.id} />}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-foreground pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">JAC-MATE // <span className="text-foreground/50">{profile.username}</span></h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/profile" className="brutal-button flex items-center gap-2 text-sm py-2 px-4 hover:bg-foreground hover:text-background transition-colors">
            <Settings size={16} /> Edit Profile
          </Link>
          <SmashMeter score={profile.smash_meter_score} />
          <LogoutButton />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Active Chats */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-2xl font-bold uppercase bg-foreground text-background inline-block px-2 py-1">Active Comm Links</h2>
          <div className="flex flex-col gap-4">
            {activeMatches?.length === 0 && <p className="font-mono text-sm opacity-50">NO ACTIVE CONNECTIONS</p>}
            {activeMatches?.map((match: any) => {
              const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
              return (
                <Link key={match.id} href={`/chat/${match.id}`} className="brutal-glass p-4 hover:bg-foreground hover:text-background transition-colors flex justify-between items-center group">
                  <span className="font-bold uppercase tracking-wider">{otherUser.username}</span>
                  <span className="font-mono text-xs opacity-70 group-hover:opacity-100">[{match.message_count}/20 MSG]</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Potential Matches */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold uppercase bg-foreground text-background inline-block px-2 py-1">Algorithm Recommends</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {enrichedMatches.length === 0 && <p className="font-mono text-sm opacity-50">NO NEW MATCHES IN MATRIX</p>}
            {enrichedMatches.map((pm: any) => (
              <div key={pm.profile_id} className="brutal-glass p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold uppercase">{pm.username}</h3>
                    {(pm.college || pm.branch || pm.year || pm.gender) && (
                      <div className="flex flex-wrap gap-1 mt-1 font-mono text-[11px] font-bold">
                        {pm.gender && <span className="bg-foreground/10 px-1.5 py-0.5">{pm.gender}</span>}
                        {pm.college && <span className="bg-foreground text-background px-1.5 py-0.5">{pm.college}</span>}
                        {pm.branch && <span className="border border-foreground px-1.5 py-0.5">{pm.branch}</span>}
                        {pm.year && <span className="border border-foreground px-1.5 py-0.5">{pm.year} Year</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-foreground text-background flex-shrink-0">
                    SYS.SCORE: {Number(pm.match_score).toFixed(1)}
                  </span>
                </div>
                <p className="text-sm border-l-4 border-foreground pl-4 flex-1">"{pm.bio}"</p>
                
                {pm.photo_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={pm.photo_url} alt={pm.username} className="w-full h-48 object-cover brutal-border mt-2" />
                )}

                <div className="space-y-2 mt-2 font-mono text-xs opacity-80 border-t-2 border-dashed border-foreground/30 pt-4">
                  {pm.quote && <p><span className="font-bold">QUOTE:</span> {pm.quote}</p>}
                  {pm.movie && <p><span className="font-bold">MOVIE:</span> {pm.movie}</p>}
                  {pm.music && <p><span className="font-bold">MUSIC:</span> {pm.music}</p>}
                  {pm.hobbies && pm.hobbies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="font-bold">HOBBIES:</span>
                      {pm.hobbies.map((h: string) => (
                        <span key={h} className="bg-foreground text-background px-1">{h}</span>
                      ))}
                    </div>
                  )}
                </div>


                <InitiateButton profileId={pm.profile_id} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
