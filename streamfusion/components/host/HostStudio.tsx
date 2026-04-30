'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaceSwapCanvas, FaceSwapCanvasHandle } from './FaceSwapCanvas';
import { StreamControls } from './StreamControls';
import { ChatBox } from '@/components/shared/ChatBox';
import { useAgoraHost } from '@/hooks/useAgoraHost';
import { useRooms } from '@/hooks/useRooms';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { FaceFilterEffect } from '@/types';
import { AlertCircle, Camera, CameraOff } from 'lucide-react';

export function HostStudio() {
  const { user }   = useAuthContext();
  const agora      = useAgoraHost();
  const { createRoom, endRoom } = useRooms();
  const router     = useRouter();

  const canvasRef  = useRef<FaceSwapCanvasHandle>(null);

  const [videoStream,     setVideoStream]     = useState<MediaStream | null>(null);
  const [cameraError,     setCameraError]     = useState<string | null>(null);
  const [selectedEffect,  setSelectedEffect]  = useState<FaceFilterEffect>('beautify');
  const [roomId,          setRoomId]          = useState<string | null>(null);
  const [streamTitle,     setStreamTitle]     = useState('');

  // ── Acquire webcam on mount ────────────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false, // audio captured separately by Agora SDK
      })
      .then(s => { stream = s; setVideoStream(s); })
      .catch(() => setCameraError('Camera access was denied. Check your browser permissions.'));

    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  // ── Go Live ────────────────────────────────────────────────────────────────
  const handleGoLive = useCallback(async () => {
    const canvas = canvasRef.current?.canvas;
    if (!canvas || !user || !streamTitle.trim()) return;

    const id = await createRoom(user.uid, user.displayName ?? 'Anonymous', streamTitle.trim());
    setRoomId(id);
    await agora.startBroadcast(canvas, id);
  }, [canvasRef, user, streamTitle, agora, createRoom]);

  // ── End Stream ─────────────────────────────────────────────────────────────
  const handleEndStream = useCallback(async () => {
    await agora.stopBroadcast();
    if (roomId) await endRoom(roomId);
    router.push('/');
  }, [agora, roomId, endRoom, router]);

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">

      {/* ── Video / Canvas Area ──────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">

        {cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-zinc-950">
            <CameraOff className="w-14 h-14 text-white/20" />
            <div className="text-center">
              <p className="text-white/60 font-medium">Camera unavailable</p>
              <p className="text-white/30 text-sm mt-1">{cameraError}</p>
            </div>
          </div>
        ) : (
          <FaceSwapCanvas
            ref={canvasRef}
            videoStream={videoStream}
            options={{ effect: selectedEffect, intensity: 0.85 }}
            className="w-full h-full"
          />
        )}

        {/* LIVE badge */}
        {agora.isLive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 rounded-lg px-3 py-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-white">LIVE</span>
          </div>
        )}

        {/* Muted badge */}
        {agora.isMuted && (
          <div className="absolute top-4 right-4 bg-zinc-900/90 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60">
            🔇 Muted
          </div>
        )}

        {/* Live chat overlay — bottom-right corner */}
        {agora.isLive && roomId && (
          <div className="absolute bottom-0 right-0 w-64 sm:w-72 h-60 sm:h-72">
            <ChatBox
              roomId={roomId}
              userId={user.uid}
              userName={user.displayName ?? 'Host'}
            />
          </div>
        )}

        {/* Error toast */}
        {agora.error && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-red-950 border border-red-500/40 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{agora.error}</p>
          </div>
        )}
      </div>

      {/* ── Stream Title (pre-live only) ────────────────────────────────── */}
      {!agora.isLive && (
        <div className="px-4 py-3 bg-[#0d0d0d] border-t border-white/[0.06]">
          <input
            value={streamTitle}
            onChange={e => setStreamTitle(e.target.value.slice(0, 80))}
            placeholder="Give your stream a title…"
            className="
              w-full bg-white/[0.07] border border-white/[0.08] rounded-xl
              px-4 py-2.5 text-sm text-white placeholder-white/25
              outline-none focus:border-violet-500/50 focus:bg-white/10
              transition-all
            "
          />
        </div>
      )}

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <StreamControls
        isLive={agora.isLive}
        isMuted={agora.isMuted}
        isStarting={agora.isStarting}
        onStart={handleGoLive}
        onStop={handleEndStream}
        onToggleMute={agora.toggleMute}
        selectedEffect={selectedEffect}
        onEffectChange={setSelectedEffect}
      />
    </div>
  );
}
