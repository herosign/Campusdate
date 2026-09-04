import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ChatClient from './ChatClient';

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: match } = await supabase
    .from('matches')
    .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*)')
    .eq('id', resolvedParams.id)
    .single();

  if (!match) redirect('/dashboard');
  
  if (match.user1_id !== user.id && match.user2_id !== user.id) {
    redirect('/dashboard');
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', match.id)
    .order('created_at', { ascending: true });

  const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
  const bothConsented = match.user1_reveal_consent && match.user2_reveal_consent;

  const [{ data: otherUserTags }, { data: existingRating }] = await Promise.all([
    supabase
      .from('profile_tags')
      .select('tags(id, tag_name, category)')
      .eq('profile_id', otherUser.id),
    supabase
      .from('ratings')
      .select('moon_type')
      .eq('rater_id', user.id)
      .eq('rated_id', otherUser.id)
      .maybeSingle()
  ]);

  const tags = (otherUserTags || []).map((pt: any) => pt.tags).filter(Boolean);
  const otherUserWithTags = { ...otherUser, tags };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <ChatClient 
        initialMessages={messages || []}
        match={match}
        currentUserId={user.id}
        otherUser={otherUserWithTags}
        bothConsented={bothConsented}
        existingRating={existingRating?.moon_type || null}
      />
    </div>
  );
}
