'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMatches() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get current user's profile to check gender
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', user.id)
    .single();

  const userGender = currentProfile?.gender;
  const targetGender = userGender === 'Male' ? 'Female' : userGender === 'Female' ? 'Male' : null;

  // 1. Try calling the calculate_matches RPC
  const { data: matches, error } = await supabase.rpc('calculate_matches', {
    current_user_id: user.id
  });

  if (!error && Array.isArray(matches) && matches.length > 0) {
    // If targetGender is set, filter to ensure consistency
    if (targetGender) {
      return matches.filter((m: any) => !m.gender || m.gender === targetGender);
    }
    return matches;
  }

  if (error) {
    console.warn("RPC calculate_matches error, falling back to direct query:", error.message);
  }

  // 2. Direct Query Fallback (in case RPC was not updated in DB)
  let query = supabase
    .from('profiles')
    .select('id, username, bio, photo_url, gender, smash_meter_score')
    .neq('id', user.id);

  if (targetGender) {
    query = query.eq('gender', targetGender);
  }

  // Exclude users already matched
  const { data: existingMatches } = await supabase
    .from('matches')
    .select('user1_id, user2_id')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  const matchedUserIds = new Set<string>();
  (existingMatches || []).forEach((m: any) => {
    matchedUserIds.add(m.user1_id);
    matchedUserIds.add(m.user2_id);
  });

  const { data: fallbackProfiles } = await query.limit(30);

  const filtered = (fallbackProfiles || [])
    .filter((p: any) => !matchedUserIds.has(p.id))
    .map((p: any) => ({
      profile_id: p.id,
      username: p.username,
      bio: p.bio,
      photo_url: p.photo_url,
      gender: p.gender,
      match_score: p.smash_meter_score || 0
    }));

  return filtered;
}

export async function initiateMatch(targetProfileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('matches').insert([{
    user1_id: user.id,
    user2_id: targetProfileId
  }]).select('id').single();

  if (error) {
    console.error("Error creating match:", error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { matchId: data.id };
}

export async function submitSocialHandshake(matchId: number, consent: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch the match
  const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();
  if (!match) throw new Error('Match not found');

  if (!consent) {
    const updatePayload = {
      status: 'TERMINATED',
      terminated_by: user.id,
      user1_reveal_consent: false,
      user2_reveal_consent: false
    };

    const { error } = await supabase.from('matches').update(updatePayload).eq('id', matchId);
    if (error) {
      console.error("Error terminating match:", error);
      throw new Error(`Failed to terminate match: ${error.message}`);
    }
  } else {
    const isOtherConsented = match.user1_id === user.id ? match.user2_reveal_consent : match.user1_reveal_consent;
    const updatePayload = match.user1_id === user.id 
      ? { user1_reveal_consent: true, status: isOtherConsented ? 'REVEALED' : 'ACTIVE' }
      : { user2_reveal_consent: true, status: isOtherConsented ? 'REVEALED' : 'ACTIVE' };

    const { error } = await supabase.from('matches').update(updatePayload).eq('id', matchId);

    if (error) {
      console.error("Error updating handshake:", error);
      throw new Error(`Failed to submit handshake: ${error.message}`);
    }
  }
  
  revalidatePath(`/chat/${matchId}`);
}

export async function submitMoonRating(ratedUserId: string, moonType: 'FULL' | 'HALF' | 'QUARTER') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('ratings').upsert([
    {
      rater_id: user.id,
      rated_id: ratedUserId,
      moon_type: moonType
    }
  ], { onConflict: 'rater_id, rated_id' });

  if (error) {
    console.error("Error submitting rating:", error);
    throw new Error(`Failed to submit moon rating: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  smash_meter_score: number;
  photo_url?: string | null;
  gender?: string | null;
  college?: string | null;
  branch?: string | null;
}

export async function getSmashLeaderboard(currentUserId?: string) {
  const supabase = await createClient();

  let userId = currentUserId;
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, smash_meter_score, photo_url, gender, college, branch, created_at')
    .order('smash_meter_score', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('Failed to fetch leaderboard: ' + error.message);
  }

  const allProfiles = profiles || [];
  const rankedProfiles: LeaderboardEntry[] = allProfiles.map((p, index) => ({
    rank: index + 1,
    id: p.id,
    username: p.username || 'Anonymous',
    smash_meter_score: Number(p.smash_meter_score) || 0,
    photo_url: p.photo_url,
    gender: p.gender,
    college: p.college,
    branch: p.branch,
  }));

  const top10 = rankedProfiles.slice(0, 10);

  let currentUserEntry: LeaderboardEntry | null = null;
  let isCurrentUserInTop10 = false;

  if (userId) {
    const userIndex = rankedProfiles.findIndex(p => p.id === userId);
    if (userIndex !== -1) {
      currentUserEntry = rankedProfiles[userIndex];
      isCurrentUserInTop10 = userIndex < 10;
    }
  }

  return {
    top10,
    currentUserEntry,
    isCurrentUserInTop10,
    totalUsers: rankedProfiles.length,
  };
}
