'use client';
import { useState, useRef, useCallback } from 'react';
import {
  createAgoraClient,
  createMicrophoneTrack,
  createCanvasVideoTrack,
  joinChannel,
  publishTracks,
  leaveChannel,
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
} from '@/lib/agora';

export interface AgoraHostState {
  isLive:          boolean;
  isMuted:         boolean;
  isStarting:      boolean;
  error:           string | null;
  startBroadcast:  (canvas: HTMLCanvasElement, channelName: string) => Promise<void>;
  stopBroadcast:   () => Promise<void>;
  toggleMute:      () => void;
}

export function useAgoraHost(): AgoraHostState {
  const clientRef    = useRef<IAgoraRTCClient | null>(null);
  const videoRef     = useRef<ILocalVideoTrack | null>(null);
  const audioRef     = useRef<ILocalAudioTrack | null>(null);

  const [isLive,     setIsLive]     = useState(false);
  const [isMuted,    setIsMuted]    = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const startBroadcast = useCallback(async (
    canvas:      HTMLCanvasElement,
    channelName: string
  ): Promise<void> => {
    try {
      setIsStarting(true);
      setError(null);

      const client = createAgoraClient('live');
      clientRef.current = client;
      client.setClientRole('host');

      // Create tracks in parallel for faster startup
      const [audioTrack, videoTrack] = await Promise.all([
        createMicrophoneTrack(),
        createCanvasVideoTrack(canvas, 30),
      ]);

      audioRef.current = audioTrack;
      videoRef.current = videoTrack;

      // ⚠️  Token is null for dev (Agora "testing" mode, no-auth).
      // In production: fetch a token from your server and pass it here.
      // See: https://docs.agora.io/en/video-calling/core-functionality/authentication
      await joinChannel(client, channelName, null, null);
      await publishTracks(client, [audioTrack, videoTrack]);

      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start broadcast';
      setError(msg);
      console.error('[Agora] startBroadcast error:', err);
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stopBroadcast = useCallback(async (): Promise<void> => {
    const tracks = [videoRef.current, audioRef.current].filter(Boolean) as
      Array<ILocalVideoTrack | ILocalAudioTrack>;

    if (clientRef.current) {
      await leaveChannel(clientRef.current, tracks);
    }

    clientRef.current = null;
    videoRef.current  = null;
    audioRef.current  = null;
    setIsLive(false);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback((): void => {
    if (!audioRef.current) return;
    const next = !isMuted;
    audioRef.current.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  return { isLive, isMuted, isStarting, error, startBroadcast, stopBroadcast, toggleMute };
}
