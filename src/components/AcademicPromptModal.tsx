'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { GraduationCap, CheckSquare } from 'lucide-react';

interface Props {
  userId: string;
}

export default function AcademicPromptModal({ userId }: Props) {
  const [visible, setVisible] = useState(true);
  const [gender, setGender] = useState('Male');
  const [college, setCollege] = useState('DTU');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('1st');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const COLLEGES = ["DTU", "IGDTUW", "IIITD", "IITD", "DSEU", "NSUT-Main", "NSUT-East", "NSUT-West"];
  const BRANCHES = ["CSE", "IT", "SE", "MNC", "ECE", "EVDT", "EE", "ME", "MAM", "MAE", "CHE", "ENE", "BT", "CE"];
  const YEARS = ["1st", "2nd", "3rd", "4th"];

  if (!visible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ gender, college, branch, year })
        .eq('id', userId);

      if (error) throw error;
      setVisible(false);
      window.location.reload();
    } catch (e: any) {
      alert(`Failed to save: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="brutal-glass max-w-lg w-full p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-6">
        
        <div className="flex items-center gap-3 border-b-4 border-foreground pb-3">
          <GraduationCap size={32} />
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Complete Your Profile</h2>
            <p className="font-mono text-xs opacity-70">College & Gender verification required</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Gender */}
          <div>
            <label className="block font-black uppercase text-xs tracking-widest mb-2">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {["Male", "Female", "Others"].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-2.5 font-mono font-bold brutal-border text-xs transition-colors ${
                    gender === g 
                      ? 'bg-foreground text-background shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]' 
                      : 'bg-background text-foreground hover:bg-foreground/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {gender === 'Others' && (
              <div className="mt-2.5 p-2.5 brutal-border bg-yellow-500 text-black font-mono font-bold text-xs animate-bounce">
                ⚡ "You should send this link to your male and female friends" 💀
              </div>
            )}
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-black uppercase text-xs tracking-widest mb-1.5">College</label>
              <select
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full brutal-border p-2.5 bg-background focus:outline-none font-mono text-xs font-bold"
              >
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-black uppercase text-xs tracking-widest mb-1.5">Branch</label>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="w-full brutal-border p-2.5 bg-background focus:outline-none font-mono text-xs font-bold"
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-black uppercase text-xs tracking-widest mb-1.5">Year</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full brutal-border p-2.5 bg-background focus:outline-none font-mono text-xs font-bold"
              >
                {YEARS.map(y => <option key={y} value={y}>{y} Year</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="brutal-button w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckSquare size={16} />
            {loading ? 'SAVING...' : 'SAVE & PROCEED'}
          </button>
        </form>

      </div>
    </div>
  );
}
