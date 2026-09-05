'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Tag, CheckSquare } from 'lucide-react';

export default function TagsPromptModal({ userId }: { userId: string }) {
  const [visible, setVisible] = useState(true);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('tags').select('*').then(({ data }) => {
      if (data) setAvailableTags(data);
    });
  }, []);

  if (!visible) return null;

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0) {
      alert('Please select at least one tag.');
      return;
    }
    setLoading(true);
    try {
      // Clear existing and re-insert
      await supabase.from('profile_tags').delete().eq('profile_id', userId);
      const inserts = selectedTags.map(tagId => ({ profile_id: userId, tag_id: tagId }));
      const { error } = await supabase.from('profile_tags').insert(inserts);
      if (error) throw error;
      setVisible(false);
    } catch (e: any) {
      alert(`Failed to save tags: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(availableTags.map(t => t.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#15161c] text-zinc-900 dark:text-white max-w-2xl w-full p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2 flex-shrink-0">
          <Tag size={28} />
          <h2 className="text-2xl font-black uppercase tracking-tight">The Matrix — Select Your Tags</h2>
        </div>
        <p className="font-mono text-sm opacity-70 mb-6 flex-shrink-0">
          Tags are <span className="font-bold text-foreground opacity-100">mandatory</span> for the matching algorithm. Pick everything that defines your vibe.
        </p>

        {/* Tag Selector — scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6">
          {categories.map(category => (
            <div key={category as string}>
              <h3 className="font-black uppercase text-xs tracking-widest bg-foreground text-background inline-block px-2 py-1 mb-3">
                {(category as string).replace(/_/g, ' ')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.filter(t => t.category === category).map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-2 text-sm font-mono border-2 transition-all ${
                        isSelected
                          ? 'bg-foreground text-background border-foreground font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] translate-x-[-2px] translate-y-[-2px]'
                          : 'bg-background text-foreground border-foreground/30 hover:border-foreground'
                      }`}
                    >
                      {tag.tag_name.replace(/^tag_/, '').replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-shrink-0 border-t-4 border-foreground pt-4">
          <span className="font-mono text-sm opacity-60">
            {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedTags.length === 0}
            className="brutal-button flex items-center gap-2 disabled:opacity-40"
          >
            <CheckSquare size={16} />
            {loading ? 'SAVING...' : 'SAVE & ENTER'}
          </button>
        </div>
      </div>
    </div>
  );
}
