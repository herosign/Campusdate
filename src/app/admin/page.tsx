import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, MessageSquare, Heart, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  // Fetch admin stats using RPC
  const { data: stats, error: statsError } = await supabase.rpc('get_admin_stats');
  const { data: users, error: usersError } = await supabase.rpc('get_admin_users');

  if (statsError || usersError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl text-red-500">Error loading admin data</h1>
        <p>{statsError?.message || usersError?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 space-y-8 pb-20">
      <header className="flex justify-between items-center border-b-4 border-foreground pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-red-600 flex items-center gap-3">
            <ShieldAlert size={36} /> OVERSEER TERMINAL
          </h1>
          <p className="font-mono text-sm opacity-60">SYSTEM ADMINISTRATION & MONITORING</p>
        </div>
        <Link href="/dashboard" className="brutal-button flex items-center gap-2">
          <ArrowLeft size={16} /> EXIT TERMINAL
        </Link>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="brutal-glass p-6 border-t-8 border-foreground">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black uppercase text-xl">Total Users</h3>
            <Users size={24} className="opacity-50" />
          </div>
          <p className="text-5xl font-black font-mono">{stats.total_users}</p>
          <div className="mt-4 flex gap-4 font-mono text-sm font-bold opacity-70">
            <span className="text-blue-500">M: {stats.total_males}</span>
            <span className="text-pink-500">F: {stats.total_females}</span>
          </div>
        </div>

        <div className="brutal-glass p-6 border-t-8 border-foreground">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black uppercase text-xl">Total Matches</h3>
            <Heart size={24} className="opacity-50" />
          </div>
          <p className="text-5xl font-black font-mono">{stats.total_matches}</p>
        </div>

        <div className="brutal-glass p-6 border-t-8 border-foreground">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black uppercase text-xl">Total Messages</h3>
            <MessageSquare size={24} className="opacity-50" />
          </div>
          <p className="text-5xl font-black font-mono">{stats.total_messages}</p>
        </div>
      </section>

      {/* Users List */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-widest border-b-2 border-foreground pb-2">User Registry</h2>
        <div className="overflow-x-auto brutal-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground text-background font-mono text-sm uppercase">
                <th className="p-3 border-r border-background/20">Username</th>
                <th className="p-3 border-r border-background/20">Email</th>
                <th className="p-3 border-r border-background/20">Details</th>
                <th className="p-3">Tags</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {users?.map((u: any, idx: number) => (
                <tr key={u.id} className={`border-b border-foreground/20 ${idx % 2 === 0 ? 'bg-black/5' : ''}`}>
                  <td className="p-3 font-bold border-r border-foreground/20">{u.username}</td>
                  <td className="p-3 opacity-80 border-r border-foreground/20">{u.email || 'N/A'}</td>
                  <td className="p-3 border-r border-foreground/20">
                    <span className={u.gender === 'Male' ? 'text-blue-500 font-bold' : 'text-pink-500 font-bold'}>{u.gender}</span>
                    <br/>
                    <span className="text-xs opacity-70">{u.college} • {u.branch} • {u.year}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {u.tags.map((t: any) => (
                        <span key={t.id} className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                          {t.label}
                        </span>
                      ))}
                      {u.tags.length === 0 && <span className="opacity-50 text-xs">No tags</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
