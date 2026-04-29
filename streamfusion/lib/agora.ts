/**
 * Agora RTC Integration Layer
 * ──────────────────────────
 * All Agora SDK calls are isolated here so the rest of the app
 * never imports agora-rtc-sdk-ng directly. Swap this file to
 * switch to LiveKit, Daily, or any other WebRTC provider.
 *
 * Agora SDK docs: https://docs.agora.io/en/video-calling/reference/api
 */

import AgoraRTC, {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  ClientConfig,
} from 'agora-rtc-sdk-ng';

export type {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
};

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? '';

// ─── Client Factory ───────────────────────────────────────────────────────────

export function createAgoraClient(mode: 'live' | 'rtc' = 'live'): IAgoraRTCClient {
  const config: ClientConfig = { mode, codec: 'vp8' };
  const client = AgoraRTC.createClient(config);

  // Reduce noisy logs in production
  if (process.env.NODE_ENV === 'production') {
    AgoraRTC.setLogLevel(3); // 3 = NONE
  }

  return client;
}

// ─── Track Factories ──────────────────────────────────────────────────────────

/** Microphone audio track for the host */
export async function createMicrophoneTrack(): Promise<ILocalAudioTrack> {
  return AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: 'music_standard',
    AEC: true,  // Acoustic echo cancellation
    ANS: true,  // Automatic noise suppression
    AGC: true,  // Automatic gain control
  });
}

/**
 * Custom video track sourced from a <canvas> element.
 * The canvas has already been processed by the face-swap pipeline.
 *
 * @param canvas  The processed canvas (output of applyFaceSwapEffect)
 * @param fps     Target frame rate (30 recommended)
 */
export async function createCanvasVideoTrack(
  canvas: HTMLCanvasElement,
  fps: number = 30
): Promise<ILocalVideoTrack> {
  const stream      = canvas.captureStream(fps);
  const videoTrack  = stream.getVideoTracks()[0];

  return AgoraRTC.createCustomVideoTrack({
    mediaStreamTrack: videoTrack,
    frameRate:        fps,
    bitrateMin:       400,
    bitrateMax:       1500,
  });
}

// ─── Channel Operations ───────────────────────────────────────────────────────

/** Join an Agora channel. Pass `null` for token in development (no-auth mode). */
export async function joinChannel(
  client:      IAgoraRTCClient,
  channelName: string,
  token:       string | null = null,
  uid:         string | null = null
): Promise<string | number> {
  return client.join(APP_ID, channelName, token, uid);
}

/** Publish one or more tracks to the channel. */
export async function publishTracks(
  client: IAgoraRTCClient,
  tracks: Array<ILocalVideoTrack | ILocalAudioTrack>
): Promise<void> {
  await client.publish(tracks);
}

/** Gracefully stop tracks and leave the channel. */
export async function leaveChannel(
  client: IAgoraRTCClient,
  tracks: Array<ILocalVideoTrack | ILocalAudioTrack>
): Promise<void> {
  tracks.forEach(t => t.close());
  await client.leave();
}
