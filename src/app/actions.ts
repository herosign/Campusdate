'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMatches() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Call the matching algorithm RPC
  const { data: matches, error } = await supabase.rpc('calculate_matches', {
    current_user_id: user.id
  });

  if (error) {
    console.error("Error fetching matches:", error);
    return [];
  }

  return matches;
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
