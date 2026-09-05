import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileEditClient from './ProfileEditClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: tags }, { data: profileTags }, { data: matches }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('tags').select('*').order('category'),
    supabase.from('profile_tags').select('tag_id').eq('profile_id', user.id),
    supabase
      .from('matches')
      .select('*, user1:profiles!user1_id(id, username, photo_url, instagram_handle, bio), user2:profiles!user2_id(id, username, photo_url, instagram_handle, bio)')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
  ]);

  if (!profile) redirect('/onboarding');

  const selectedTagIds = (profileTags || []).map((pt: any) => pt.tag_id);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <ProfileEditClient
        profile={profile}
        allTags={tags || []}
        initialSelectedTagIds={selectedTagIds}
        userId={user.id}
        matches={matches || []}
      />
    </div>
  );
}
