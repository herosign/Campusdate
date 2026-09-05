'use client';

import { useState } from 'react';
import { HelpCircle, BookOpen } from 'lucide-react';
import TutorialModal from './TutorialModal';

interface Props {
  className?: string;
  variant?: 'button' | 'icon' | 'compact';
}

export default function TutorialButton({ className = '', variant = 'button' }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`brutal-border p-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer ${className}`}
          title="How Campus Date Works (Guide)"
          aria-label="How Campus Date Works Guide"
        >
          <HelpCircle size={18} />
        </button>
      ) : variant === 'compact' ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`brutal-border px-2.5 py-1.5 bg-background text-foreground hover:bg-foreground hover:text-background text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${className}`}
          title="How Campus Date Works (Guide)"
          aria-label="How Campus Date Works Guide"
        >
          <HelpCircle size={14} className="text-yellow-500" />
          <span>GUIDE</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`brutal-button bg-background text-foreground hover:bg-foreground hover:text-background flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 px-3 sm:px-4 transition-colors ${className}`}
          title="Learn how chatting & mutual reveal work"
        >
          <BookOpen size={14} className="text-rose-500" />
          <span>HOW IT WORKS</span>
        </button>
      )}

      <TutorialModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
