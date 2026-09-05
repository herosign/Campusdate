'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { KeyRound, EyeOff, Eye } from 'lucide-react';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="brutal-glass p-6">
      <div className="flex items-center gap-2 mb-6">
        <KeyRound size={20} />
        <h2 className="text-xl font-black uppercase tracking-wider">Account Security</h2>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 text-red-500 border-2 border-red-500 p-3 font-mono text-sm font-bold">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/20 text-green-600 dark:text-green-400 border-2 border-green-500 p-3 font-mono text-sm font-bold">
            {message}
          </div>
        )}

        <div className="space-y-2 relative">
          <label className="font-mono text-sm uppercase font-bold">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full brutal-border p-3 bg-background focus:outline-none focus:ring-4 focus:ring-foreground/20 font-mono"
              placeholder="ENTER NEW PASSWORD"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="font-mono text-sm uppercase font-bold">Confirm New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full brutal-border p-3 bg-background focus:outline-none focus:ring-4 focus:ring-foreground/20 font-mono"
            placeholder="CONFIRM NEW PASSWORD"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !newPassword || !confirmPassword}
          className="brutal-button w-full sm:w-auto mt-4 disabled:opacity-50"
        >
          {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
        </button>
      </form>
    </div>
  );
}
