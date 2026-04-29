'use client';
import { useState, useRef, useEffect } from 'react';
import {
  createAgoraClient,
  joinChannel,
  IAgoraRTCClient,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from '@/lib/agora';

export interface AgoraViewerState {
  remoteVideoTrack: IRemoteVideoTrack | null;
  remoteAudioTrack: IRemoteAudioTrack | null;
  isConnected:      boolean;
  hostLeft:         boolean;
  error:            string | null;
}

export function useAgoraViewer(channelName: string): AgoraViewerState {
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  const [remoteVideoTrack, setRemoteVideoTrack] = useState<IRemoteVideoTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<IRemoteAudioTrack | null>(null);
  const [isConnected,      setIsConnected]      = useState(false);
  const [hostLeft,         setHostLeft]         = useState(false);
  const [error,            setError]            = useState<string | null>(null);

  useEffect(() => {
    if (!channelName) return;
    let mounted = true;

    const join = async () => {
      try {
        const client = createAgoraClient('live');
        clientRef.current = client;
        client.setClientRole('audience');

        // ── Handle host publishing ─────────────────────────────────────────
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (!mounted) return;

          if (mediaType === 'video') {
            setRemoteVideoTrack(user.videoTrack ?? null);
          }
          if (mediaType === 'audio') {
            setRemoteAudioTrack(user.audioTrack ?? null);
            user.audioTrack?.play(); // auto-play audio
          }
        });

        // ── Handle host un-publishing ──────────────────────────────────────
        client.on('user-unpublished', (_user, mediaType) => {
          if (!mounted) return;
          if (mediaType === 'video') setRemoteVideoTrack(null);
          if (mediaType === 'audio') setRemoteAudioTrack(null);
        });

        // ── Host left the channel ──────────────────────────────────────────
        client.on('user-left', () => {
          if (mounted) setHostLeft(true);
        });

        // ── Network quality (optional: surface in UI) ──────────────────────
        client.on('network-quality', ({ downlinkNetworkQuality }) => {
          if (downlinkNetworkQuality >= 5 && mounted) {
            console.warn('[Agora] Poor network quality:', downlinkNetworkQuality);
          }
        });

        // ⚠️  Token is null for dev. Replace with a server-issued token in prod.
        await joinChannel(client, channelName, null, null);
        if (mounted) setIsConnected(true);

      } catch (err: unknown) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : 'Failed to join stream';
          setError(msg);
        }
        console.error('[Agora] viewer join error:', err);
      }
    };

    join();

    return () => {
      mounted = false;
      clientRef.current?.leave().catch(() => null);
      clientRef.current = null;
    };
  }, [channelName]);

  return { remoteVideoTrack, remoteAudioTrack, isConnected, hostLeft, error };
}
