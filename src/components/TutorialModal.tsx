'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Lock, 
  AtSign, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
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
    headline: 'You have exactly 50 messages to make an impression.',
    description: [
      'Every chat on Campus Date is capped at **50 messages** total.',
      'No endless texting or ghosting in limbo. Use your conversational charm, reference mutual campus spots, shared music vibe, and witty banter.',
      'Make every text count before the message counter runs out!'
    ],
    highlight: '50 Messages Total • Make Every Message Count',
    highlightIcon: Zap,
  },
  {
    step: 2,
    title: 'THE MUTUAL REVEAL MOMENT',
    badge: 'PROTOCOL 02',
    badgeColor: 'bg-pink-500 text-white',
    icon: Lock,
    headline: 'At 50 messages, identity choice unlocks.',
    description: [
      'Once message #50 is sent, the chat pauses and prompts both users for the **Identity Reveal Decision**.',
      'You are given two clear choices:',
      '• **REVEAL IDENTITY**: You want to share your Instagram handle and take the conversation off-platform.',
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
    headline: 'Both agree -> Instagram unlocked. One declines -> Clean termination.',
    description: [
      '✅ **Mutual Consent (Both Click Reveal)**: The screen reveals both of your verified Instagram handles with direct links. Move to Instagram DMs and take your connection to the next level!',
      '❌ **Either User Declines**: The link is permanently terminated with no Instagram handle shown. Complete privacy is guaranteed.'
    ],
    highlight: 'Consensual Social Handshake • 100% Secure',
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
      'After each chat finishes, you submit a mandatory **Moon Rating** for their conversation vibe:',
      '• 🌕 **Full Moon (+3.0 Smash Score)**: Outstanding vibe & top-tier conversationalist.',
      '• 🌓 **Half Moon (+1.5 Smash Score)**: Good vibe, enjoyable conversation.',
      '• 🌘 **Quarter Moon (+0.5 Smash Score)**: Decent interaction.',
      'Scores elevate your Smash Meter tier (up to *GOD TIER ASCENDED*) and push you up the **Campus Leaderboard**!'
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
      <div className="brutal-glass max-w-2xl w-full flex flex-col border-4 border-foreground shadow-[8px_8px_0px_0px] relative bg-background text-foreground overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b-4 border-foreground flex justify-between items-center bg-foreground text-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                HOW CAMPUS DATE WORKS
              </h2>
              <p className="font-mono text-xs opacity-80 uppercase">
                THE 50-MSG PROTOCOL & DATING GUIDE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-background hover:text-foreground transition-colors border border-background font-black cursor-pointer"
            aria-label="Close guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 border-b-4 border-foreground bg-foreground/5 text-center font-mono text-xs font-bold">
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              className={`py-2.5 px-2 border-r last:border-r-0 border-foreground transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                currentStep === idx
                  ? 'bg-foreground text-background font-black'
                  : currentStep > idx
                  ? 'bg-foreground/20 text-foreground'
                  : 'hover:bg-foreground/10 text-foreground/70'
              }`}
            >
              <span>#{s.step}</span>
              <span className="hidden sm:inline">{idx === 0 ? '50 MSGS' : idx === 1 ? 'REVEAL' : idx === 2 ? 'INSTA' : 'RATING'}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[60vh]">
          
          {/* Step Badge & Title */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${stepData.badgeColor}`}>
              {stepData.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              {stepData.title}
            </h3>
          </div>

          {/* Headline box */}
          <div className="p-4 brutal-border bg-foreground text-background flex items-center gap-4">
            <div className="p-3 bg-background text-foreground border-2 border-background flex-shrink-0">
              <StepIcon size={28} />
            </div>
            <p className="font-mono text-sm sm:text-base font-bold leading-snug">
              {stepData.headline}
            </p>
          </div>

          {/* Descriptions */}
          <div className="space-y-3 font-mono text-sm leading-relaxed">
            {stepData.description.map((desc, i) => (
              <p key={i} className="opacity-90">
                {desc.split('**').map((chunk, ci) => 
                  ci % 2 === 1 ? <strong key={ci} className="font-black text-foreground underline decoration-yellow-400 decoration-2">{chunk}</strong> : chunk
                )}
              </p>
            ))}
          </div>

          {/* Highlight Card */}
          <div className="p-3 brutal-border bg-yellow-400/20 dark:bg-yellow-400/10 border-yellow-500 flex items-center gap-2.5 font-mono text-xs font-bold text-foreground">
            <HighlightIcon size={16} className="text-yellow-500 flex-shrink-0" />
            <span>{stepData.highlight}</span>
          </div>

        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-6 border-t-4 border-foreground bg-foreground/5 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="brutal-button text-xs py-2 px-4 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> PREVIOUS
          </button>

          <span className="font-mono text-xs font-bold opacity-60">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </span>

          {currentStep < TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
              className="brutal-button bg-yellow-400 text-black hover:bg-yellow-300 text-xs py-2 px-4 flex items-center gap-1"
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
