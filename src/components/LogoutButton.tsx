'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

export default function LogoutButton({ className = '', variant = 'default' }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`font-mono text-xs font-bold uppercase tracking-wider text-red-600 hover:underline flex items-center gap-1.5 cursor-pointer ${className}`}
        title="Terminate Session & Sign Out"
      >
        <LogOut size={14} />
        <span>{loading ? 'LOGGING OUT...' : 'LOGOUT'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`brutal-border font-mono font-bold uppercase tracking-wider text-xs py-2 px-4 bg-background text-red-600 border-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 cursor-pointer ${className}`}
      title="Terminate Session & Sign Out"
    >
      <LogOut size={14} />
      <span>{loading ? 'TERMINATING...' : 'LOGOUT'}</span>
    </button>
  );
}
