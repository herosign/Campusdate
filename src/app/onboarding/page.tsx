'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { ArrowRight, CheckSquare } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    movie: '',
    quote: '',
    photo_url: '',
    music: '',
    instagram_handle: '',
    gender: 'Male',
    college: 'DTU',
    branch: 'CSE',
    year: '1st',
    hobbies: [] as string[]
  });
  
  const [hobbyInput, setHobbyInput] = useState('');

  const COLLEGES = ["DTU", "IGDTUW", "IIITD", "IITD", "DSEU", "NSUT-Main", "NSUT-East", "NSUT-West"];
  const BRANCHES = ["CSE", "IT", "SE", "MNC", "ECE", "EVDT", "EE", "ME", "MAM", "MAE", "CHE", "ENE", "BT", "CE"];
  const YEARS = ["1st", "2nd", "3rd", "4th"];

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const addHobby = () => {
    if (hobbyInput.trim() && formData.hobbies.length < 5) {
      setFormData({ ...formData, hobbies: [...formData.hobbies, hobbyInput.trim()] });
      setHobbyInput('');
    }
  };

  const removeHobby = (index: number) => {
    const newHobbies = [...formData.hobbies];
    newHobbies.splice(index, 1);
    setFormData({ ...formData, hobbies: newHobbies });
  };

  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Restore draft state from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('jac_mate_onboarding_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.selectedTags) setSelectedTags(parsed.selectedTags);
        if (parsed.step) setStep(parsed.step);
      }
    } catch (e) {
      console.warn('Failed to restore draft onboarding data:', e);
    }
  }, []);

  // Auto-save draft whenever inputs or steps change
  useEffect(() => {
    try {
      localStorage.setItem('jac_mate_onboarding_draft', JSON.stringify({
        formData,
        selectedTags,
        step,
      }));
    } catch (e) {
      // Ignore quota errors
    }
  }, [formData, selectedTags, step]);

  // Fetch tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase.from('tags').select('*');
      if (data) setAvailableTags(data);
    };
    fetchTags();
  }, []);

  const toggleTag = (id: number) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter(t => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: profileError } = await supabase.from('profiles').upsert([
        { 
          id: user.id,
          email: user.email, // Save email in public.profiles table
          ...formData
        }
      ]);
      if (profileError) throw profileError;

      // Save tags
      if (selectedTags.length > 0) {
        // Clear old tags first to avoid unique constraint errors on re-submission
        await supabase.from('profile_tags').delete().eq('profile_id', user.id);
        
        const tagInserts = selectedTags.map(tagId => ({
          profile_id: user.id,
          tag_id: tagId
        }));
        const { error: tagError } = await supabase.from('profile_tags').insert(tagInserts);
        if (tagError) throw tagError;
      }
      
      // Clear saved draft on successful submission
      try {
        localStorage.removeItem('jac_mate_onboarding_draft');
      } catch (e) {}

      router.push('/dashboard');
    } catch (error: any) {
      const msg = error?.message || JSON.stringify(error);
      console.error('Onboarding error:', msg, error);
      alert(`Failed to save profile: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="brutal-glass max-w-2xl w-full p-8 space-y-8">
        <h1 className="text-4xl font-bold uppercase tracking-tighter border-b-4 border-foreground pb-4">Onboarding</h1>
        
        {step === 1 && (
          <div className="space-y-6 flex flex-col">
            <h2 className="text-2xl font-bold">1. Identity & College Matrix</h2>
            
            <div>
              <label className="block font-bold mb-2 uppercase text-sm">Username</label>
              <input 
                type="text" 
                className="w-full brutal-border p-4 bg-background focus:outline-none"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                placeholder="UNIQUE_ID_001"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block font-bold mb-2 uppercase text-sm">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {["Male", "Female", "Others"].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-3 font-mono font-bold brutal-border transition-colors ${
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
                <label className="block font-bold mb-2 uppercase text-xs">College</label>
                <select
                  value={formData.college}
                  onChange={e => setFormData({ ...formData, college: e.target.value })}
                  className="w-full brutal-border p-3 bg-background focus:outline-none font-mono text-sm"
                >
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase text-xs">Branch</label>
                <select
                  value={formData.branch}
                  onChange={e => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full brutal-border p-3 bg-background focus:outline-none font-mono text-sm"
                >
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase text-xs">Year</label>
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
              <label className="block font-bold mb-2 uppercase text-sm">Bio</label>
              <textarea 
                className="w-full brutal-border p-4 bg-background focus:outline-none"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                rows={3}
                placeholder="Describe your architecture..."
              />
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase text-sm">Instagram Handle <span className="text-red-500">*</span></label>
              <div className="flex items-center brutal-border bg-background">
                <span className="px-4 py-4 font-bold opacity-50 border-r-2 border-foreground">@</span>
                <input 
                  type="text" 
                  className="flex-1 p-4 bg-background focus:outline-none font-mono"
                  value={formData.instagram_handle}
                  onChange={e => setFormData({...formData, instagram_handle: e.target.value.replace('@', '')})}
                  placeholder="your.insta.handle"
                />
              </div>
              <p className="text-xs font-mono opacity-60 mt-1">Revealed only if both users mutually consent after 20 messages.</p>
            </div>

            <button className="brutal-button self-end" onClick={handleNext}>Next <ArrowRight className="inline ml-2" size={16}/></button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 flex flex-col">
            <h2 className="text-2xl font-bold">2. The Core 5</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 uppercase text-sm">1. Favourite Movie</label>
                <input type="text" className="w-full brutal-border p-3 bg-background focus:outline-none"
                  value={formData.movie} onChange={e => setFormData({...formData, movie: e.target.value})} />
              </div>
              
              <div>
                <label className="block font-bold mb-2 uppercase text-sm">2. Favourite Quote</label>
                <input type="text" className="w-full brutal-border p-3 bg-background focus:outline-none"
                  value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} />
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase text-sm">3. Profile Photo</label>
                <ImageUpload
                  onUpload={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
                  currentImageUrl={formData.photo_url}
                />
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase text-sm">4. Music Taste</label>
                <input type="text" className="w-full brutal-border p-3 bg-background focus:outline-none"
                  value={formData.music} onChange={e => setFormData({...formData, music: e.target.value})} />
              </div>

              <div>
                <label className="block font-bold mb-2 uppercase text-sm">5. Hobbies (Max 5)</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 brutal-border p-3 bg-background focus:outline-none"
                    value={hobbyInput} onChange={e => setHobbyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addHobby()}
                    disabled={formData.hobbies.length >= 5}
                  />
                  <button className="brutal-button" onClick={addHobby} disabled={formData.hobbies.length >= 5}>ADD</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.hobbies.map((h, i) => (
                    <div key={i} className="brutal-border px-3 py-1 bg-white flex items-center gap-2 text-black">
                      <span className="font-bold">{h}</span>
                      <button onClick={() => removeHobby(i)} className="text-black hover:text-red-600 font-bold">X</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button className="brutal-button" onClick={handlePrev}>Back</button>
              <button className="brutal-button bg-foreground text-background" onClick={handleNext}>
                Next <ArrowRight className="inline ml-2" size={16}/>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 flex flex-col">
            <h2 className="text-2xl font-bold">3. The Matrix (Algorithm Tags)</h2>
            <p className="font-mono text-sm opacity-70">Select the tags that define your vibe. These power your matchmaking algorithm.</p>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto p-2">
              {Array.from(new Set(availableTags.map(t => t.category))).map(category => (
                <div key={category} className="space-y-2">
                  <h3 className="font-bold uppercase border-b-2 border-foreground/30 inline-block">{category as string}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.filter(t => t.category === category).map(tag => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1 text-sm font-mono border-2 transition-colors ${
                            isSelected 
                              ? 'bg-foreground text-background border-foreground font-bold' 
                              : 'bg-background text-foreground border-foreground/30 hover:border-foreground'
                          }`}
                        >
                          {tag.tag_name.replace('tag_', '').replace(/_/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button className="brutal-button" onClick={handlePrev}>Back</button>
              <button className="brutal-button bg-foreground text-background" onClick={submitForm} disabled={loading}>
                {loading ? 'Processing...' : <><CheckSquare className="inline mr-2" size={16}/> Complete Setup</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
