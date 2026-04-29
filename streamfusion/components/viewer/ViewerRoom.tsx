'use client';
import { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { ChatBox } from '@/components/shared/ChatBox';
import { useAgoraViewer } from '@/hooks/useAgoraViewer';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useRooms } from '@/hooks/useRooms';
import { ArrowLeft, MessageCircle, X, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';

interface Props {
  roomId:    string;
  roomTitle: string;
  hostName:  string;
}

export function ViewerRoom({ roomId, roomTitle, hostName }: Props) {
  const { user }                  = useAuthContext();
  const { adjustViewerCount }     = useRooms();
  const { remoteVideoTrack, isConnected, hostLeft, error } = useAgoraViewer(roomId);

  const [chatOpen, setChatOpen] = useState(false);

  // ── Viewer count tracking ────────────────────────────────────────────────
  useEffect(() => {
    adjustViewerCount(roomId, 1);
    return () => { adjustViewerCount(roomId, -1); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  if (!user) return null;

  return (
    <div className="relative flex flex-col h-screen bg-black overflow-hidden">

      {/* ── Full-screen video ─────────────────────────────────────────── */}
      <div className="absolute inset-0">
        <VideoPlayer videoTrack={remoteVideoTrack} isConnected={isConnected} />
      </div>

      {/* ── Top HUD ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-safe pt-4">
        {/* Back button */}
        <Link
          href="/"
          className="p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-black/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Stream info pill */}
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 px-3 py-2 flex-1 min-w-0">
          {hostLeft ? (
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
          <span className="text-xs font-bold tracking-wider text-white/90">
            {hostLeft ? 'ENDED' : 'LIVE'}
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/60 text-xs truncate">{hostName}</span>
        </div>
      </div>

      {/* ── Stream-ended banner ────────────────────────────────────── */}
      {hostLeft && (
        <div className="relative z-10 mx-4 mt-3 bg-amber-950/80 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-3 text-center">
          <p className="text-amber-300 font-medium text-sm">This stream has ended</p>
          <Link href="/" className="text-amber-400/70 text-xs mt-0.5 block hover:underline">
            Browse other streams →
          </Link>
        </div>
      )}

      {/* ── Error banner ───────────────────────────────────────────── */}
      {error && (
        <div className="relative z-10 mx-4 mt-3 bg-red-950/80 backdrop-blur-sm border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* ── Chat panel (slides up from bottom) ───────────────────── */}
      {chatOpen && (
        <div className="absolute z-20 bottom-24 left-0 right-0 mx-3 h-72 rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl">
          <ChatBox
            roomId={roomId}
            userId={user.uid}
            userName={user.displayName ?? 'Viewer'}
          />
        </div>
      )}

      {/* ── Bottom bar ────────────────────────────────────────────── */}
      <div className="relative z-10 mt-auto">
        {/* Gradient scrim */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-safe pb-8 pt-10 flex items-end justify-between">
          {/* Stream title / host */}
          <div className="min-w-0 mr-4">
            <h1 className="text-white font-semibold text-base leading-tight truncate">
              {roomTitle}
            </h1>
            <p className="text-white/50 text-sm mt-0.5">{hostName}</p>
          </div>

          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen(v => !v)}
            className={`
              shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
              font-medium text-sm transition-all
              ${chatOpen
                ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                : 'bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:bg-black/80'}
            `}
          >
            {chatOpen
              ? <><X className="w-4 h-4" /> Close</>
              : <><MessageCircle className="w-4 h-4" /> Chat</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
