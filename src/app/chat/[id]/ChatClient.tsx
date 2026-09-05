'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Send, Handshake, AlertTriangle, XOctagon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { submitSocialHandshake } from '@/app/actions';
import MoonRatingCard from '@/components/MoonRatingCard';

interface Message {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Match {
  id: number;
  message_count: number;
  user1_id: string;
  user2_id: string;
  user1_reveal_consent: boolean;
  user2_reveal_consent: boolean;
  status?: string;
  terminated_by?: string;
}

interface ChatClientProps {
  initialMessages: Message[];
  match: Match;
  currentUserId: string;
  otherUser: any;
  bothConsented: boolean;
  existingRating?: 'FULL' | 'HALF' | 'QUARTER' | null;
}

export default function ChatClient({ 
  initialMessages, 
  match, 
  currentUserId, 
  otherUser, 
  bothConsented: initialBothConsented,
  existingRating = null
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [currentMatch, setCurrentMatch] = useState<Match>(match);
  const [messageCount, setMessageCount] = useState(match.message_count);
  const [hasConsented, setHasConsented] = useState(
    match.user1_id === currentUserId ? match.user1_reveal_consent : match.user2_reveal_consent
  );
  const [isTerminated, setIsTerminated] = useState(match.status === 'TERMINATED');
  
  const supabase = createClient();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const channel = supabase.channel(`match_${match.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${match.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        setMessageCount(prev => prev + 1);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${match.id}`
      }, (payload) => {
        const updated = payload.new as Match;
        setCurrentMatch(updated);
        if (updated.status === 'TERMINATED') {
          setIsTerminated(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, supabase]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || messageCount >= 20 || isTerminated) return;

    const msg = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('messages').insert([{
      match_id: match.id,
      sender_id: currentUserId,
      content: msg
    }]);

    if (error) {
      console.error(error);
      alert('Failed to send message');
    }
  };

  const handleHandshake = async (consent: boolean) => {
    try {
      if (!consent) {
        setIsTerminated(true);
        setCurrentMatch(prev => ({ ...prev, status: 'TERMINATED', terminated_by: currentUserId }));
      } else {
        setHasConsented(true);
      }
      await submitSocialHandshake(match.id, consent);
    } catch (e) {
      console.error(e);
      alert('Action failed. Please try again.');
    }
  };

  const isLimitReached = messageCount >= 20;
  const bothConsented = (currentMatch.user1_reveal_consent && currentMatch.user2_reveal_consent) || initialBothConsented;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[calc(100vh-8rem)]">
      
      {/* Profile Details (Left Side) */}
      <div className="col-span-1 flex flex-col gap-6 overflow-y-auto pb-8 pr-4 custom-scrollbar">
        <div className="flex justify-between items-end border-b-4 border-foreground pb-2">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-widest leading-none">
              {otherUser.username}
            </h2>
            {(otherUser.college || otherUser.branch || otherUser.year || otherUser.gender) && (
              <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-xs font-bold">
                {otherUser.gender && <span className="bg-foreground/10 px-2 py-0.5">{otherUser.gender}</span>}
                {otherUser.college && <span className="bg-foreground text-background px-2 py-0.5">{otherUser.college}</span>}
                {otherUser.branch && <span className="border-2 border-foreground px-2 py-0.5">{otherUser.branch}</span>}
                {otherUser.year && <span className="border-2 border-foreground px-2 py-0.5">{otherUser.year} Year</span>}
              </div>
            )}
          </div>
          <span className="font-mono text-sm font-bold bg-foreground text-background px-2 py-1 flex-shrink-0">PROFILE</span>
        </div>

        {otherUser.photo_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={otherUser.photo_url} 
            alt={otherUser.username} 
            className="w-full aspect-[4/5] object-cover brutal-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]" 
          />
        )}
        
        <div className="brutal-glass p-6 mt-4">
          <p className="text-lg font-medium italic border-l-4 border-foreground pl-4 mb-6">"{otherUser.bio}"</p>
          
          <div className="space-y-4 font-mono text-sm">
            {otherUser.quote && (
              <div>
                <span className="block font-black uppercase mb-1">Quote:</span> 
                <span className="bg-foreground/10 px-2 py-1">{otherUser.quote}</span>
              </div>
            )}
            {otherUser.movie && (
              <div>
                <span className="block font-black uppercase mb-1">Fav Movie:</span> 
                <span className="bg-foreground/10 px-2 py-1">{otherUser.movie}</span>
              </div>
            )}
            {otherUser.music && (
              <div>
                <span className="block font-black uppercase mb-1">Music Vibe:</span> 
                <span className="bg-foreground/10 px-2 py-1">{otherUser.music}</span>
              </div>
            )}
            {otherUser.hobbies && otherUser.hobbies.length > 0 && (
              <div>
                <span className="block font-black uppercase mb-2">Hobbies:</span>
                <div className="flex flex-wrap gap-2">
                  {otherUser.hobbies.map((h: string) => (
                    <span key={h} className="bg-foreground text-background px-2 py-1 font-bold text-xs">{h}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface (Right Side) */}
      <div className="col-span-1 flex flex-col h-full lg:border-l-4 border-foreground lg:pl-12 pb-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b-4 border-foreground mb-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="brutal-border p-2 hover:bg-foreground hover:text-background transition-colors" title="Back to Dashboard">
              <ArrowLeft size={18} />
            </Link>
            <h2 className="text-2xl font-bold uppercase">COMM LINK</h2>
          </div>
          <div className="font-mono bg-foreground text-background px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            {messageCount} / 20 MSGS
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto space-y-4 p-6 brutal-glass mb-4 shadow-[inset_0px_0px_10px_rgba(0,0,0,0.1)]">
          {messages.length === 0 && (
             <div className="h-full flex items-center justify-center font-mono opacity-50 uppercase text-center">
                Comm link established.<br/>Send the first message.
             </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 max-w-[85%] sm:max-w-[70%] font-medium leading-relaxed ${
                    isMe 
                    ? 'bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]' 
                    : 'bg-background text-foreground brutal-border'
                  }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input, Handshake Modal, or Termination Banner */}
        {isTerminated ? (
          (() => {
            const isTerminatedByMe = currentMatch.terminated_by === currentUserId;
            return (
              <div className="space-y-4">
                <div className={`brutal-border p-6 bg-black text-white flex flex-col items-center justify-center space-y-4 text-center border-4 ${
                  isTerminatedByMe ? 'border-yellow-500 shadow-[8px_8px_0px_0px_rgba(234,179,8,1)]' : 'border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]'
                }`}>
                  <div className={`${isTerminatedByMe ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'} p-3 rounded-full`}>
                    <XOctagon size={40} />
                  </div>
                  <h3 className={`text-2xl font-black uppercase tracking-wider ${isTerminatedByMe ? 'text-yellow-400' : 'text-red-500'}`}>
                    {isTerminatedByMe ? 'LINK DECLINED BY YOU' : 'PROTOCOL TERMINATED'}
                  </h3>
                  <p className={`text-xl font-black font-mono uppercase px-4 py-2 border-2 ${
                    isTerminatedByMe 
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' 
                      : 'bg-red-950/80 text-red-200 border-red-600'
                  }`}>
                    {isTerminatedByMe ? '"You deserve better"' : '"Your game is not strong"'}
                  </p>
                  <p className="font-mono text-xs opacity-70 max-w-md">
                    {isTerminatedByMe 
                      ? 'You chose to decline the identity reveal. This communication protocol is permanently closed.' 
                      : 'The other user declined the mutual reveal request. Communication has been terminated.'}
                  </p>
                  <Link href="/dashboard" className="brutal-button bg-white text-black hover:bg-gray-200 mt-2 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> RETURN TO MATRIX
                  </Link>
                </div>

                {/* Compulsory Rating */}
                <MoonRatingCard
                  ratedUserId={otherUser.id}
                  ratedUsername={otherUser.username}
                  initialRating={existingRating}
                />
              </div>
            );
          })()
        ) : !isLimitReached && !bothConsented ? (
          <form onSubmit={sendMessage} className="flex gap-4">
            <input 
              type="text" 
              className="flex-1 brutal-border p-4 bg-background focus:outline-none focus:ring-4 focus:ring-foreground/20 font-mono"
              placeholder="ENTER MESSAGE..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
            <button type="submit" className="brutal-button flex items-center justify-center w-16">
              <Send size={24} />
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="brutal-border p-6 bg-red-600 text-white flex flex-col items-center justify-center space-y-6 text-center">
              <AlertTriangle size={48} />
              <h3 className="text-2xl font-black uppercase">Message Limit Reached</h3>
              
              {bothConsented ? (
                <div className="space-y-4">
                  <p className="font-bold">MUTUAL CONSENT GRANTED.</p>
                  <div className="bg-white text-black p-4 brutal-border">
                    Social Handle: <a href={`https://instagram.com/${otherUser.instagram_handle}`} target="_blank" className="underline font-black">{otherUser.instagram_handle}</a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-lg">
                  <p className="font-bold">The protocol dictates that you must now choose to reveal your social identity to continue communication off-platform.</p>
                  {hasConsented ? (
                    <p className="bg-black/20 p-4 font-mono font-bold animate-pulse">WAITING FOR OTHER USER CONSENT...</p>
                  ) : (
                    <div className="flex gap-4 justify-center mt-4">
                      <button onClick={() => handleHandshake(true)} className="brutal-button bg-white text-black hover:bg-green-400">
                        <Handshake className="inline mr-2" /> REVEAL IDENTITY
                      </button>
                      <button onClick={() => handleHandshake(false)} className="brutal-button bg-black hover:bg-gray-800">
                        DECLINE & TERMINATE
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Compulsory Rating */}
            <MoonRatingCard
              ratedUserId={otherUser.id}
              ratedUsername={otherUser.username}
              initialRating={existingRating}
            />
          </div>
        )}
      </div>
    </div>
  );
}
