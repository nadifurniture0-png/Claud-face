'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from '@/components/shared/RoomCard';
import { Navbar } from '@/components/shared/Navbar';
import { Radio, Loader2, Tv2, Zap, Shield, Sparkles } from 'lucide-react';

// ─── Login / Onboarding Screen ────────────────────────────────────────────────

function LoginScreen() {
  const { signInAsGuest } = useAuthContext();
  const [name,      setName]      = useState('');
  const [loading,   setLoading]   = useState(false);

  const onJoin = async () => {
    setLoading(true);
    await signInAsGuest(name || undefined);
    setLoading(false);
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') onJoin(); };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-fuchsia-900/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_40px_rgba(139,92,246,0.4)] mx-auto">
            <Radio className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Stream<span className="text-fuchsia-400">Fusion</span>
            </h1>
            <p className="text-white/40 mt-2 text-sm leading-relaxed">
              Go live with real-time AI face filters.<br />Watch, chat, and connect.
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex justify-center gap-3 flex-wrap">
          {[
            { icon: <Sparkles className="w-3 h-3" />, text: 'AI Filters' },
            { icon: <Zap className="w-3 h-3" />,      text: 'Ultra-low latency' },
            { icon: <Shield className="w-3 h-3" />,   text: 'Anonymous' },
          ].map(f => (
            <span key={f.text} className="flex items-center gap-1.5 text-xs text-white/40 border border-white/10 rounded-full px-3 py-1">
              {f.icon} {f.text}
            </span>
          ))}
        </div>

        {/* Sign-in form */}
        <div className="space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={onKey}
            placeholder="Choose a display name (optional)"
            maxLength={32}
            className="
              w-full bg-white/[0.06] border border-white/[0.1] rounded-xl
              px-4 py-3.5 text-white placeholder-white/25 text-sm
              outline-none focus:border-violet-500/60 focus:bg-white/[0.09]
              transition-all
            "
          />
          <button
            onClick={onJoin}
            disabled={loading}
            className="
              w-full bg-gradient-to-r from-violet-600 to-fuchsia-600
              hover:from-violet-500 hover:to-fuchsia-500
              disabled:opacity-60 disabled:cursor-not-allowed
              rounded-xl py-3.5 font-semibold text-white transition-all
              flex items-center justify-center gap-2
              shadow-[0_4px_24px_rgba(139,92,246,0.35)]
            "
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</>
              : 'Join as Guest →'
            }
          </button>
        </div>

        <p className="text-center text-white/20 text-xs">
          No email required · Powered by Firebase Anonymous Auth
        </p>
      </div>
    </div>
  );
}

// ─── Home / Discovery Screen ──────────────────────────────────────────────────

function HomeScreen() {
  const { rooms, loading } = useRooms();

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="pt-14 max-w-screen-xl mx-auto px-4">

        {/* ── Go Live CTA ─────────────────────────────────────────────── */}
        <div className="py-5">
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/60 to-fuchsia-950/40 p-5">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent pointer-events-none" />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">
                  Start Broadcasting
                </h2>
                <p className="text-white/40 text-sm mt-0.5">
                  Go live with AI face filters in seconds
                </p>
              </div>
              <Link href="/host">
                <button className="
                  shrink-0 flex items-center gap-2
                  bg-gradient-to-r from-violet-600 to-fuchsia-600
                  hover:from-violet-500 hover:to-fuchsia-500
                  rounded-xl px-4 py-2.5 font-semibold text-sm text-white
                  shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all
                ">
                  <Radio className="w-4 h-4" />
                  Go Live
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Live Rooms ───────────────────────────────────────────────── */}
        <section className="pb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Tv2 className="w-5 h-5 text-violet-400" />
              Live Now
            </h2>
            {rooms.length > 0 && (
              <span className="text-xs bg-violet-600/80 text-white rounded-full px-2.5 py-0.5 font-medium">
                {rooms.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <Tv2 className="w-14 h-14 text-white/10 mx-auto" />
              <p className="text-white/30 font-medium">No streams live right now</p>
              <p className="text-white/20 text-sm">Be the first to go live today!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return user ? <HomeScreen /> : <LoginScreen />;
}
