'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Lock, 
  AtSign, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle,
  Flame,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'THE 50-MESSAGE IMPRESSION PROTOCOL',
    badge: 'PROTOCOL 01',
    badgeColor: 'bg-yellow-400 text-black',
    icon: MessageSquare,
    headline: 'You have exactly 50 messages to make a strong impression.',
    description: [
      'Every chat on Campus Date is capped at **50 messages** total between both users.',
      'No endless ghosting in limbo. Use your conversational wit, find mutual campus spots, vibe over music, and share inside jokes.',
      'Make every text count before the message counter reaches 50!'
    ],
    highlight: '50 Messages Total • Make Every Text Count',
    highlightIcon: Zap,
  },
  {
    step: 2,
    title: 'THE MUTUAL REVEAL MOMENT',
    badge: 'PROTOCOL 02',
    badgeColor: 'bg-pink-500 text-white',
    icon: Lock,
    headline: 'At 50 messages, the identity choice unlocks for both of you.',
    description: [
      'Once message #50 is reached, the chat pauses and prompts both participants for the **Identity Reveal Decision**.',
      'You will choose between two clear actions:',
      '• **REVEAL IDENTITY**: You want to share your Instagram handle and continue off-platform.',
      '• **DECLINE & TERMINATE**: You prefer not to share socials and conclude the connection.'
    ],
    highlight: 'Strict Privacy • Zero Automated Reveals',
    highlightIcon: ShieldCheck,
  },
  {
    step: 3,
    title: 'INSTAGRAM UNLOCK OR CLEAN EXIT',
    badge: 'PROTOCOL 03',
    badgeColor: 'bg-emerald-500 text-white',
    icon: AtSign,
    headline: 'Both agree -> Instagram unlocked. One declines -> Clean exit.',
    description: [
      '✅ **Mutual Consent (Both Click Reveal)**: Both of your verified Instagram handles are revealed with direct profile links. Move to Instagram DMs and continue your connection!',
      '❌ **Either User Declines**: The connection is permanently terminated with no Instagram handle shown. Complete privacy is guaranteed.'
    ],
    highlight: '100% Consensual Social Handshake',
    highlightIcon: CheckCircle2,
  },
  {
    step: 4,
    title: 'MOON RATINGS & SMASH METER',
    badge: 'PROTOCOL 04',
    badgeColor: 'bg-purple-600 text-white',
    icon: Sparkles,
    headline: 'Rate their vibe to boost their Smash Meter and campus rank.',
    description: [
      'After each chat concludes, you submit a mandatory **Moon Rating** for their vibe:',
      '• 🌕 **Full Moon (+3.0 Smash Score)**: Outstanding vibe & top-tier conversationalist.',
      '• 🌓 **Half Moon (+1.5 Smash Score)**: Good vibe, enjoyable conversation.',
      '• 🌘 **Quarter Moon (+0.5 Smash Score)**: Decent interaction.',
      'Scores elevate your Smash Meter tier (up to *GOD TIER ASCENDED*) and climb the **Campus Leaderboard**!'
    ],
    highlight: 'Climb the Top 10 Campus Leaderboard',
    highlightIcon: Flame,
  }
];

export default function TutorialModal({ isOpen, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stepData = TUTORIAL_STEPS[currentStep];
  const StepIcon = stepData.icon;
  const HighlightIcon = stepData.highlightIcon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#15161c] text-zinc-900 dark:text-white max-w-2xl w-full flex flex-col border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b-4 border-foreground flex justify-between items-center bg-black text-white dark:bg-zinc-900 dark:text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                HOW CAMPUS DATE WORKS
              </h2>
              <p className="font-mono text-xs text-zinc-300 uppercase">
                THE 50-MSG PROTOCOL & DATING GUIDE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:text-black transition-colors border border-white font-black cursor-pointer"
            aria-label="Close guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 border-b-4 border-foreground bg-zinc-100 dark:bg-zinc-800 text-center font-mono text-xs font-bold">
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              className={`py-3 px-2 border-r last:border-r-0 border-foreground transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                currentStep === idx
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : currentStep > idx
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                  : 'hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span>#{s.step}</span>
              <span className="hidden sm:inline">{idx === 0 ? '50 MSGS' : idx === 1 ? 'REVEAL' : idx === 2 ? 'INSTA' : 'RATING'}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-[#15161c]">
          
          {/* Step Badge & Title */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${stepData.badgeColor}`}>
              {stepData.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              {stepData.title}
            </h3>
          </div>

          {/* Headline Box */}
          <div className="p-4 brutal-border bg-black text-white dark:bg-zinc-900 dark:text-white flex items-center gap-4">
            <div className="p-3 bg-white text-black dark:bg-black dark:text-white border-2 border-black dark:border-white flex-shrink-0">
              <StepIcon size={28} />
            </div>
            <p className="font-mono text-sm sm:text-base font-bold leading-snug text-white">
              {stepData.headline}
            </p>
          </div>

          {/* Descriptions */}
          <div className="space-y-3 font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {stepData.description.map((desc, i) => (
              <p key={i}>
                {desc.split('**').map((chunk, ci) => 
                  ci % 2 === 1 ? (
                    <strong key={ci} className="font-black text-black dark:text-white underline decoration-yellow-400 decoration-2">
                      {chunk}
                    </strong>
                  ) : (
                    chunk
                  )
                )}
              </p>
            ))}
          </div>

          {/* Highlight Card */}
          <div className="p-3.5 brutal-border bg-yellow-400/20 dark:bg-yellow-400/10 border-yellow-500 flex items-center gap-2.5 font-mono text-xs font-bold text-zinc-900 dark:text-yellow-300">
            <HighlightIcon size={18} className="text-yellow-500 flex-shrink-0" />
            <span>{stepData.highlight}</span>
          </div>

        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-6 border-t-4 border-foreground bg-zinc-100 dark:bg-zinc-900 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="brutal-button text-xs py-2 px-4 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed bg-white text-black dark:bg-zinc-800 dark:text-white"
          >
            <ChevronLeft size={16} /> PREVIOUS
          </button>

          <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </span>

          {currentStep < TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
              className="brutal-button bg-yellow-400 text-black hover:bg-yellow-300 text-xs py-2 px-4 flex items-center gap-1 font-black"
            >
              NEXT <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="brutal-button bg-green-500 text-black hover:bg-green-400 text-xs py-2 px-5 flex items-center gap-1 font-black"
            >
              GOT IT, LET'S MATCH! <CheckCircle2 size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
