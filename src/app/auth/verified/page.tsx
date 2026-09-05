'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogIn, ArrowRight, AlertCircle } from 'lucide-react';

function VerifiedContent() {
  const searchParams = useSearchParams();
  const isError = searchParams.get('status') === 'error';

  return (
    <div className="min-h-screen p-6 md:p-12 flex items-center justify-center">
      <div className="brutal-glass max-w-lg w-full p-8 md:p-10 space-y-8">
        
        {/* Status Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 brutal-border ${isError ? 'bg-red-600 text-white' : 'bg-foreground text-background'}`}>
              {isError ? <AlertCircle size={32} /> : <ShieldCheck size={32} />}
            </div>
            <div>
              <span className="font-mono text-xs uppercase font-bold tracking-widest opacity-60">
                AUTH PROTOCOL // {isError ? 'FAILED' : 'VERIFIED'}
              </span>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                {isError ? 'VERIFICATION FAILED' : 'EMAIL CONFIRMED'}
              </h1>
            </div>
          </div>
          <div className="h-1 bg-foreground w-full" />
        </div>

        {/* Message Body */}
        {!isError ? (
          <div className="space-y-4">
            <p className="font-medium text-base leading-relaxed">
              Your email address has been successfully verified in the JAC Delhi campus database.
            </p>
            <div className="p-4 brutal-border bg-foreground/5 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="opacity-60">STATUS:</span>
                <span className="font-bold text-green-700 dark:text-green-400">ACTIVE & READY</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">DEVICE:</span>
                <span className="font-bold">CROSS-PLATFORM SYNCED</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">NEXT ACTION:</span>
                <span className="font-bold">PROCEED TO SIGN IN</span>
              </div>
            </div>
            <p className="text-xs font-mono opacity-60">
              If you registered on a laptop, you can now log in here or return to your laptop to sign in with your credentials.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-medium text-base text-red-700 dark:text-red-400">
              The verification link has expired or has already been used.
            </p>
            <p className="text-xs font-mono opacity-70">
              Try signing in directly. If your email is already confirmed, your credentials will authenticate immediately.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <Link
            href="/login"
            className="brutal-button w-full flex items-center justify-center gap-3 text-center py-4"
          >
            <LogIn size={18} />
            <span className="font-black tracking-wider">CONTINUE TO LOGIN</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Footer info */}
        <div className="text-center border-t border-foreground/20 pt-4">
          <span className="font-mono text-[11px] opacity-50 uppercase tracking-widest">
            CAMPUS DATE // HYPER-LOCALIZED CAMPUS SYSTEM
          </span>
        </div>

      </div>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center font-mono text-sm uppercase">
        Loading verification state...
      </div>
    }>
      <VerifiedContent />
    </Suspense>
  );
}
