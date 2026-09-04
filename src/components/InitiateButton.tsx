'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { initiateMatch } from '@/app/actions';

import { useRouter } from 'next/navigation';

export default function InitiateButton({ profileId }: { profileId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await initiateMatch(profileId);
      if (result?.error) {
        alert(`Failed: ${result.error}`);
      } else if (result?.matchId) {
        router.push(`/chat/${result.matchId}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      className="brutal-button w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <UserPlus size={16} /> {loading ? 'INITIATING...' : 'INITIATE LINK'}
    </button>
  );
}
