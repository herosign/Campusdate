'use client';

import { useState } from 'react';
import { AtSign, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function InstaPromptModal({ userId }: { userId: string }) {
  const [visible, setVisible] = useState(true);
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!visible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ instagram_handle: handle.trim().replace('@', '') })
      .eq('id', userId);
    if (!error) setVisible(false);
    else alert('Failed to save. Please try again.');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#15161c] text-zinc-900 dark:text-white max-w-md w-full p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative">
        
        {/* dismiss button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 font-black text-foreground/50 hover:text-foreground"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <AtSign size={32} className="text-pink-500" />
          <h2 className="text-2xl font-black uppercase tracking-tight">Link Your Instagram</h2>
        </div>

        <p className="font-mono text-sm opacity-70 mb-6 leading-relaxed">
          Campus Date's "Mutual Reveal" feature needs your Instagram handle. It's <span className="font-bold text-foreground opacity-100">never shared automatically</span> — only if you AND your match both agree after 50 messages.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center brutal-border bg-background">
            <span className="px-4 py-4 font-bold opacity-50 border-r-2 border-foreground">@</span>
            <input
              type="text"
              className="flex-1 p-4 bg-transparent focus:outline-none font-mono"
              placeholder="your.insta.handle"
              value={handle}
              onChange={e => setHandle(e.target.value.replace('@', ''))}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || !handle.trim()}
            className="brutal-button w-full disabled:opacity-50"
          >
            {loading ? 'SAVING...' : 'SAVE & CONTINUE'}
          </button>
        </form>
      </div>
    </div>
  );
}
