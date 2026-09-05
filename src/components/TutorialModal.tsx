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
  Zap,
  Heart
} from 'lucide-react';
import { useUITheme } from '@/context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'THE 50-MESSAGE IMPRESSION PROTOCOL',
    badge: 'STAGE 01',
    badgeColor: 'bg-rose-100 text-rose-600 border-rose-200',
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
    badge: 'STAGE 02',
    badgeColor: 'bg-pink-100 text-pink-600 border-pink-200',
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
    badge: 'STAGE 03',
    badgeColor: 'bg-purple-100 text-purple-600 border-purple-200',
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
    title: 'VIBE CHECKS & SMASH METER',
    badge: 'STAGE 04',
    badgeColor: 'bg-rose-100 text-rose-600 border-rose-200',
    icon: Sparkles,
    headline: 'Rate their vibe to boost their Smash Meter and campus rank.',
    description: [
      'After each chat concludes, you submit a mandatory **Moon Rating** for their vibe:',
      '• 🌕 **Full Moon (+3.0 Score)**: Outstanding vibe & top-tier conversationalist.',
      '• 🌓 **Half Moon (+1.5 Score)**: Good vibe, enjoyable conversation.',
      '• 🌘 **Quarter Moon (+0.5 Score)**: Decent interaction.',
      'Scores elevate your Smash Meter tier (up to *GOD TIER ASCENDED*) and climb the **Campus Leaderboard**!'
    ],
    highlight: 'Climb the Top 10 Campus Leaderboard',
    highlightIcon: Flame,
  }
];

export default function TutorialModal({ isOpen, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const { uiTheme } = useUITheme();

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={uiTheme === 'neo-brutal' ? "w-full max-w-2xl flex flex-col relative overflow-hidden bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "glass-panel max-w-2xl w-full flex flex-col relative overflow-hidden bg-white/95 dark:bg-zinc-950/95 shadow-2xl"}>
        
        {/* Top Header */}
        <div className={uiTheme === 'neo-brutal' ? "p-5 sm:p-6 bg-black text-white flex justify-between items-center border-b-4 border-black z-10" : "p-5 sm:p-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white flex justify-between items-center rounded-t-3xl shadow-sm z-10"}>
          <div className="flex items-center gap-4">
            <div className={uiTheme === 'neo-brutal' ? "p-3 bg-yellow-400 text-black border-2 border-black" : "p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl shadow-inner border border-white/30"}>
              <HelpCircle size={24} className={uiTheme === 'neo-brutal' ? "text-black" : "fill-white"} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">
                HOW CAMPUS DATE WORKS
              </h2>
              <p className={uiTheme === 'neo-brutal' ? "text-xs font-bold text-yellow-400 mt-0.5 uppercase tracking-widest" : "text-sm font-medium text-rose-100 opacity-90 mt-0.5"}>
                THE 50-MSG PROTOCOL & DATING GUIDE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={uiTheme === 'neo-brutal' ? "p-2 border border-white hover:bg-white/20 text-white transition-colors" : "p-2.5 rounded-full hover:bg-white/20 transition-colors text-white"}
            aria-label="Close guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className={uiTheme === 'neo-brutal' ? "flex items-center bg-white border-b-4 border-black" : "flex justify-between items-center px-6 py-4 bg-rose-50/50 dark:bg-zinc-900/50 border-b border-rose-100 dark:border-zinc-800"}>
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              className={uiTheme === 'neo-brutal' ? `flex-1 py-3 px-1 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 border-r-4 border-black last:border-r-0 ${currentStep === idx ? 'bg-black text-white' : 'bg-white text-zinc-400 hover:text-black'}` : `flex-1 mx-1 py-2 px-1 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentStep === idx
                  ? 'bg-rose-500 text-white shadow-md'
                  : currentStep > idx
                  ? 'bg-rose-200 text-rose-700 dark:bg-zinc-700 dark:text-zinc-300'
                  : 'hover:bg-rose-100 text-zinc-500 dark:hover:bg-zinc-800 dark:text-zinc-500'
              }`}
            >
              <span className={uiTheme === 'neo-brutal' ? "font-bold" : "w-5 h-5 rounded-full flex items-center justify-center bg-white/20 text-[10px]"}>
                {uiTheme === 'neo-brutal' ? `#${s.step}` : s.step}
              </span>
              <span className="hidden sm:inline">{idx === 0 ? '50 MSGS' : idx === 1 ? 'REVEAL' : idx === 2 ? 'INSTA' : 'RATING'}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-zinc-950 relative">
          
          {/* Step Badge & Title */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={uiTheme === 'neo-brutal' ? "px-3 py-1 text-[10px] font-bold uppercase border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : `px-3 py-1 text-[10px] font-bold uppercase rounded-full border shadow-sm ${stepData.badgeColor}`}>
              {stepData.badge}
            </span>
            <h3 className={uiTheme === 'neo-brutal' ? "text-xl sm:text-2xl font-black tracking-tight text-black uppercase" : "text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white"}>
              {stepData.title}
            </h3>
          </div>

          {/* Headline Box */}
          <div className={uiTheme === 'neo-brutal' ? "p-5 bg-black text-white flex items-center gap-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]" : "p-5 rounded-3xl bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center gap-5 shadow-md"}>
            <div className={uiTheme === 'neo-brutal' ? "p-3 bg-white text-black border-2 border-white flex-shrink-0" : "p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white shadow-inner flex-shrink-0"}>
              <StepIcon size={28} />
            </div>
            <p className={uiTheme === 'neo-brutal' ? "text-base sm:text-lg font-mono font-bold leading-snug" : "text-base sm:text-lg font-bold leading-snug"}>
              {stepData.headline}
            </p>
          </div>

          {/* Descriptions */}
          <div className={uiTheme === 'neo-brutal' ? "space-y-4 text-sm leading-relaxed text-black dark:text-white font-mono px-2" : "space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium px-2"}>
            {stepData.description.map((desc, i) => (
              <p key={i}>
                {desc.split('**').map((chunk, ci) => 
                  ci % 2 === 1 ? (
                    <strong key={ci} className={uiTheme === 'neo-brutal' ? "font-bold text-black border-b-2 border-yellow-400 dark:text-white" : "font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1 rounded"}>
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
          <div className={uiTheme === 'neo-brutal' ? "p-4 border-2 border-black bg-white flex items-center gap-3 text-xs font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 flex items-center gap-3 text-xs font-bold text-rose-700 dark:text-rose-300"}>
            <HighlightIcon size={20} className={uiTheme === 'neo-brutal' ? "text-black flex-shrink-0" : "text-rose-500 flex-shrink-0"} />
            <span className={uiTheme === 'neo-brutal' ? "uppercase" : ""}>{stepData.highlight}</span>
          </div>

        </div>

        {/* Footer Controls */}
        <div className={uiTheme === 'neo-brutal' ? "p-5 sm:p-6 border-t-4 border-black bg-white flex justify-between items-center z-10" : "p-5 sm:p-6 border-t border-rose-100 dark:border-zinc-800 bg-rose-50/50 dark:bg-zinc-900/50 flex justify-between items-center rounded-b-3xl"}>
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={uiTheme === 'neo-brutal' ? "brutal-button px-5 py-2.5 bg-zinc-200 text-black border-2 border-black disabled:opacity-40 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700 shadow-sm transition-all"}
          >
            <ChevronLeft size={18} /> PREVIOUS
          </button>

          <span className={uiTheme === 'neo-brutal' ? "text-sm font-black text-black bg-yellow-400 border-2 border-black px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "text-sm font-bold text-rose-400 dark:text-rose-500 bg-rose-100 dark:bg-rose-900/30 px-4 py-1.5 rounded-full"}>
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </span>

          {currentStep < TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
              className={uiTheme === 'neo-brutal' ? "brutal-button px-6 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2" : "px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 bg-rose-500 text-white hover:bg-rose-600 shadow-md transition-all hover:scale-[1.02]"}
            >
              NEXT <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className={uiTheme === 'neo-brutal' ? "brutal-button px-6 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2" : "px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-rose-500/30 transition-all hover:scale-[1.02]"}
            >
              GOT IT, LET'S MATCH! <CheckCircle2 size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
