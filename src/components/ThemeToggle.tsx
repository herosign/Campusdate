'use client';

import { useUITheme } from '@/context/ThemeContext';
import { Palette, Sparkles, Box } from 'lucide-react';

export default function ThemeToggle() {
  const { uiTheme, setUITheme, mounted } = useUITheme();

  // Wait until mounted to prevent hydration errors
  if (!mounted) return <div className="w-8 h-8" />; 

  return (
    <button
      onClick={() => setUITheme(uiTheme === 'romantic' ? 'neo-brutal' : 'romantic')}
      className="p-2 sm:p-2.5 rounded-full brutal-border !border-zinc-200 dark:!border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-foreground transition-all flex items-center justify-center gap-2"
      title="Toggle UI Theme (Romantic / Neo-Brutalist)"
      aria-label="Toggle UI Theme"
    >
      {uiTheme === 'romantic' ? (
        <>
          <Box size={18} className="text-zinc-700 dark:text-zinc-300" />
          <span className="hidden sm:inline text-xs font-bold font-mono tracking-wider">NEO-BRUTAL</span>
        </>
      ) : (
        <>
          <Sparkles size={18} className="text-rose-500" />
          <span className="hidden sm:inline text-xs font-bold tracking-wider text-rose-500">ROMANTIC</span>
        </>
      )}
    </button>
  );
}
