'use client';
import { useEffect, useRef } from 'react';
import { IRemoteVideoTrack } from '@/lib/agora';
import { Loader2, Wifi, Radio } from 'lucide-react';

interface Props {
  videoTrack:  IRemoteVideoTrack | null;
  isConnected: boolean;
}

/**
 * VideoPlayer
 * ───────────
 * Agora requires a DOM element to call `.play(container)` on.
 * This component creates that container and manages the track lifecycle.
 */
export function VideoPlayer({ videoTrack, isConnected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !videoTrack) return;
    videoTrack.play(containerRef.current);
    return () => { videoTrack.stop(); };
  }, [videoTrack]);

  // ── Loading / waiting states ──────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="text-white/40 text-sm font-medium">Connecting to stream…</p>
      </div>
    );
  }

  if (!videoTrack) {
    return (
      <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-violet-900/30 flex items-center justify-center">
            <Radio className="w-8 h-8 text-violet-400" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-violet-500" />
          </span>
        </div>
        <p className="text-white/40 text-sm">Waiting for host video…</p>
      </div>
    );
  }

  // ── Active stream ─────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
    />
  );
}
