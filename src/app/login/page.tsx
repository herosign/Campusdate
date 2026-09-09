'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const redirectUrl = `${window.location.origin}/auth/callback?next=/auth/verified`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectUrl = `${window.location.origin}/auth/callback?next=/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link sent to your email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="brutal-glass max-w-md w-full p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            CAMPUS DATE
          </h1>
          <p className="font-mono text-sm opacity-60">
            {isSignUp ? 'CREATE YOUR ACCOUNT' : 'ACCESS THE SYSTEM'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold mb-2 uppercase text-sm">
              Email
            </label>
            <input
              type="email"
              className="w-full brutal-border p-4 bg-background focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block font-bold uppercase text-sm">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="font-mono text-[10px] uppercase underline opacity-70 hover:opacity-100 cursor-pointer"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              className="w-full brutal-border p-4 bg-background focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="brutal-border bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 p-3 font-mono text-sm">
              ERR: {error}
            </div>
          )}

          {message && (
            <div className="brutal-border bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 p-3 font-mono text-sm">
              SYS: {message}
            </div>
          )}

          <button
            type="submit"
            className="brutal-button w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : isSignUp ? (
              <>
                <UserPlus size={16} /> Register
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="font-mono text-sm underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
