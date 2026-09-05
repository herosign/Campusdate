'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { Save, ArrowLeft, X, Plus, ExternalLink, HeartHandshake, UserX, XCircle, AtSign } from 'lucide-react';
import SmashMeter from '@/components/SmashMeter';
import LogoutButton from '@/components/LogoutButton';
import ChangePassword from '@/components/ChangePassword';
import TutorialButton from '@/components/TutorialButton';

interface Props {
  profile: any;
  allTags: any[];
  initialSelectedTagIds: number[];
  userId: string;
  matches?: any[];
}

export default function ProfileEditClient({ profile, allTags, initialSelectedTagIds, userId, matches = [] }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hobbyInput, setHobbyInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>(initialSelectedTagIds);

  const [formData, setFormData] = useState({
    username: profile.username || '',
    bio: profile.bio || '',
    movie: profile.movie || '',
    quote: profile.quote || '',
    photo_url: profile.photo_url || '',
    music: profile.music || '',
    instagram_handle: profile.instagram_handle || '',
    gender: profile.gender || 'Male',
    college: profile.college || 'DTU',
    branch: profile.branch || 'CSE',
    year: profile.year || '1st',
    hobbies: profile.hobbies || [] as string[],
  });

  const COLLEGES = ["DTU", "IGDTUW", "IIITD", "IITD", "DSEU", "NSUT-Main", "NSUT-East", "NSUT-West"];
  const BRANCHES = ["CSE", "IT", "SE", "MNC", "ECE", "EVDT", "EE", "ME", "MAM", "MAE", "CHE", "ENE", "BT", "CE"];
  const YEARS = ["1st", "2nd", "3rd", "4th"];

  // Categorize historical matches
  const revealedMatches = matches.filter((m: any) => 
    (m.user1_reveal_consent && m.user2_reveal_consent) || m.status === 'REVEALED'
  ).map((m: any) => {
    const other = m.user1_id === userId ? m.user2 : m.user1;
    return { ...m, other };
  });

  const rejectedByMe = matches.filter((m: any) => 
    m.status === 'TERMINATED' && m.terminated_by === userId
  ).map((m: any) => {
    const other = m.user1_id === userId ? m.user2 : m.user1;
    return { ...m, other };
  });

  const rejectedMe = matches.filter((m: any) => 
    m.status === 'TERMINATED' && m.terminated_by && m.terminated_by !== userId
  ).map((m: any) => {
    const other = m.user1_id === userId ? m.user2 : m.user1;
    return { ...m, other };
  });

  const addHobby = () => {
    if (hobbyInput.trim() && formData.hobbies.length < 5) {
      setFormData({ ...formData, hobbies: [...formData.hobbies, hobbyInput.trim()] });
      setHobbyInput('');
    }
  };

  const removeHobby = (index: number) => {
    const updated = [...formData.hobbies];
    updated.splice(index, 1);
    setFormData({ ...formData, hobbies: updated });
  };

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    // Validate all mandatory fields
    const requiredFields = [
      { key: 'username', label: 'Username' },
      { key: 'bio', label: 'Bio' },
      { key: 'movie', label: 'Favorite Movie' },
      { key: 'music', label: 'Music Vibe' },
      { key: 'quote', label: 'Favorite Quote' },
      { key: 'instagram_handle', label: 'Instagram Handle' },
      { key: 'photo_url', label: 'Profile Photo' }
    ];

    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData] || String(formData[field.key as keyof typeof formData]).trim() === '') {
        alert(`Please fill out the "${field.label}" field.`);
        return;
      }
    }

    if (formData.hobbies.length === 0) {
      alert("Please add at least one hobby.");
      return;
    }

    if (selectedTags.length === 0) {
      alert("Please select at least one tag.");
      return;
    }

    setLoading(true);
    setSaved(false);
    try {
      // Save profile fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ ...formData })
        .eq('id', userId);
      if (profileError) throw profileError;

      // Save tags
      await supabase.from('profile_tags').delete().eq('profile_id', userId);
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase.from('profile_tags').insert(
          selectedTags.map(tagId => ({ profile_id: userId, tag_id: tagId }))
        );
        if (tagError) throw tagError;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(allTags.map(t => t.category)));

  const field = (label: string, key: keyof typeof formData, placeholder = '') => (
    <div>
      <label className="block font-black uppercase text-xs tracking-widest mb-2">{label}</label>
      <input
        type="text"
        className="w-full brutal-border p-3 bg-background focus:outline-none font-mono"
        value={formData[key] as string}
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-foreground pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="brutal-border p-2 hover:bg-foreground hover:text-background transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tight">Edit Profile</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TutorialButton />
          <SmashMeter score={profile.smash_meter_score} userId={profile.id} />
          <button
            onClick={handleSave}
            disabled={loading}
            className="brutal-button flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? 'SAVING...' : saved ? '✓ SAVED!' : 'SAVE CHANGES'}
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* Photo */}
      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase bg-foreground text-background inline-block px-2 py-1">Photo</h2>
        <div className="flex justify-center p-4 brutal-glass">
          <ImageUpload
            onUpload={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
            currentImageUrl={formData.photo_url}
          />
        </div>
      </section>

      {/* Identity */}
      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase bg-foreground text-background inline-block px-2 py-1">Identity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Username', 'username', 'UNIQUE_ID_001')}
          <div>
            <label className="block font-black uppercase text-xs tracking-widest mb-2">Instagram Handle</label>
            <div className="flex items-center brutal-border bg-background">
              <span className="px-3 font-bold opacity-50 border-r-2 border-foreground py-3">@</span>
              <input
                type="text"
                className="flex-1 p-3 bg-transparent focus:outline-none font-mono"
                value={formData.instagram_handle}
                onChange={e => setFormData({ ...formData, instagram_handle: e.target.value.replace('@', '') })}
                placeholder="your.insta.handle"
              />
            </div>
          </div>
        </div>
        {/* Gender Selection */}
        <div>
          <label className="block font-black uppercase text-xs tracking-widest mb-2">Gender</label>
          <div className="grid grid-cols-3 gap-3">
            {["Male", "Female", "Others"].map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setFormData({ ...formData, gender: g })}
                className={`py-3 font-mono font-bold brutal-border transition-colors text-sm ${
                  formData.gender === g 
                    ? 'bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' 
                    : 'bg-background text-foreground hover:bg-foreground/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {formData.gender === 'Others' && (
            <div className="mt-3 p-3 brutal-border bg-yellow-500 text-black font-mono font-bold text-xs animate-bounce">
              ⚡ "You should send this link to your male and female friends" 💀
            </div>
          )}
        </div>

        {/* Academic Matrix: College, Branch, Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-black uppercase text-xs tracking-widest mb-2">College</label>
            <select
              value={formData.college}
              onChange={e => setFormData({ ...formData, college: e.target.value })}
              className="w-full brutal-border p-3 bg-background focus:outline-none font-mono text-sm"
            >
              {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-black uppercase text-xs tracking-widest mb-2">Branch</label>
            <select
              value={formData.branch}
              onChange={e => setFormData({ ...formData, branch: e.target.value })}
              className="w-full brutal-border p-3 bg-background focus:outline-none font-mono text-sm"
            >
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-black uppercase text-xs tracking-widest mb-2">Year</label>
            <select
              value={formData.year}
              onChange={e => setFormData({ ...formData, year: e.target.value })}
              className="w-full brutal-border p-3 bg-background focus:outline-none font-mono text-sm"
            >
              {YEARS.map(y => <option key={y} value={y}>{y} Year</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-black uppercase text-xs tracking-widest mb-2">Bio</label>
          <textarea
            className="w-full brutal-border p-3 bg-background focus:outline-none font-mono"
            rows={3}
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Describe your architecture..."
          />
        </div>
      </section>

      {/* The Core 5 */}
      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase bg-foreground text-background inline-block px-2 py-1">The Core 5</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Favourite Movie', 'movie')}
          {field('Music Taste', 'music')}
          {field('Favourite Quote', 'quote')}
        </div>
        <div>
          <label className="block font-black uppercase text-xs tracking-widest mb-2">Hobbies (Max 5)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.hobbies.map((h: string, i: number) => (
              <div key={i} className="brutal-border px-3 py-1 bg-foreground text-background flex items-center gap-2 font-bold text-sm">
                {h}
                <button onClick={() => removeHobby(i)} className="hover:text-red-300"><X size={12} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 brutal-border p-3 bg-background focus:outline-none font-mono text-sm"
              placeholder="Add a hobby..."
              value={hobbyInput}
              onChange={e => setHobbyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHobby()}
              disabled={formData.hobbies.length >= 5}
            />
            <button onClick={addHobby} disabled={formData.hobbies.length >= 5} className="brutal-button flex items-center gap-1 disabled:opacity-40">
              <Plus size={14} /> ADD
            </button>
          </div>
        </div>
      </section>

      {/* Tags / The Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase bg-foreground text-background inline-block px-2 py-1">The Matrix — Tags</h2>
          <span className="font-mono text-sm opacity-60">{selectedTags.length} selected</span>
        </div>
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category as string}>
              <h3 className="font-black uppercase text-xs tracking-widest opacity-50 border-b border-foreground/20 pb-1 mb-3">
                {(category as string).replace(/_/g, ' ')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.filter(t => t.category === category).map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-2 text-xs font-mono border-2 transition-all ${
                        isSelected
                          ? 'bg-foreground text-background border-foreground font-bold shadow-[3px_3px_0px_0px] translate-x-[-2px] translate-y-[-2px]'
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
      </section>

      {/* 4. Matrix Encounters & Reveal History */}
      <section className="space-y-6 pt-6 border-t-4 border-foreground">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Matrix History & Social Logs</h2>
          <p className="font-mono text-xs opacity-70 mt-1">Records of your mutual reveals, declined requests, and rejections.</p>
        </div>

        {/* Mutual Reveals */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="text-green-500" size={20} />
            <h3 className="font-black uppercase text-sm tracking-wider">Unlocked Social Identities ({revealedMatches.length})</h3>
          </div>
          {revealedMatches.length === 0 ? (
            <p className="font-mono text-xs opacity-50 p-4 brutal-glass">No mutual reveals unlocked yet. Reach 50 messages with a match and grant mutual consent.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {revealedMatches.map((m: any) => (
                <div key={m.id} className="brutal-glass p-4 flex items-center justify-between border-2 border-green-500">
                  <div className="flex items-center gap-3">
                    {m.other?.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={m.other.photo_url} alt={m.other.username} className="w-12 h-12 object-cover brutal-border flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-foreground text-background font-black flex items-center justify-center text-sm brutal-border">
                        {m.other?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-black uppercase text-sm">{m.other?.username}</h4>
                      {m.other?.instagram_handle && (
                        <a 
                          href={`https://instagram.com/${m.other.instagram_handle}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="font-mono text-xs text-pink-500 font-bold hover:underline flex items-center gap-1"
                        >
                          <AtSign size={12} />{m.other.instagram_handle} <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-green-500 text-black px-2 py-1 font-bold">REVEALED</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejected by You */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserX className="text-yellow-500" size={20} />
            <h3 className="font-black uppercase text-sm tracking-wider">Rejected By You ({rejectedByMe.length})</h3>
          </div>
          {rejectedByMe.length === 0 ? (
            <p className="font-mono text-xs opacity-50 p-4 brutal-glass">No declined links.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rejectedByMe.map((m: any) => (
                <div key={m.id} className="brutal-glass p-3 flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-3">
                    {m.other?.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={m.other.photo_url} alt={m.other.username} className="w-10 h-10 object-cover brutal-border grayscale" />
                    ) : (
                      <div className="w-10 h-10 bg-foreground text-background font-black flex items-center justify-center text-xs brutal-border">
                        {m.other?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold uppercase text-xs">{m.other?.username}</h4>
                      <span className="font-mono text-[10px] text-yellow-400 font-bold">"You deserve better"</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-yellow-500 text-black px-2 py-0.5 font-bold">DECLINED</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejected You */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="text-red-500" size={20} />
            <h3 className="font-black uppercase text-sm tracking-wider">Declined You — "Game Not Strong" ({rejectedMe.length})</h3>
          </div>
          {rejectedMe.length === 0 ? (
            <p className="font-mono text-xs opacity-50 p-4 brutal-glass">Nobody has rejected you.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rejectedMe.map((m: any) => (
                <div key={m.id} className="brutal-glass p-3 flex items-center justify-between border-2 border-red-500/50">
                  <div className="flex items-center gap-3">
                    {m.other?.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={m.other.photo_url} alt={m.other.username} className="w-10 h-10 object-cover brutal-border grayscale" />
                    ) : (
                      <div className="w-10 h-10 bg-foreground text-background font-black flex items-center justify-center text-xs brutal-border">
                        {m.other?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold uppercase text-xs">{m.other?.username}</h4>
                      <span className="font-mono text-[10px] text-red-400 font-bold">"Game wasn't strong"</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 font-bold">REJECTED</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Account Security Section */}
      <section className="mb-12">
        <ChangePassword />
      </section>

      {/* Save & Logout buttons at bottom */}
      <div className="border-t-4 border-foreground pt-6 flex justify-between items-center flex-wrap gap-4">
        <LogoutButton />
        <button
          onClick={handleSave}
          disabled={loading}
          className="brutal-button flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {loading ? 'SAVING...' : saved ? '✓ SAVED!' : 'SAVE CHANGES'}
        </button>
      </div>

    </div>
  );
}
