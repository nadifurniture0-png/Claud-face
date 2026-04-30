/**
 * Agora RTC Integration Layer
 * ──────────────────────────
 * Dynamic import used throughout to prevent "window is not defined"
 * on Vercel / Next.js SSR. Agora is browser-only.
 */

import type {
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

// ─── Dynamic SDK loader (browser-only) ───────────────────────────────────────
async function getAgoraRTC() {
  const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
  if (process.env.NODE_ENV === 'production') {
    AgoraRTC.setLogLevel(3);
  }
  return AgoraRTC;
}

// ─── Client Factory ───────────────────────────────────────────────────────────
export async function createAgoraClient(
  mode: 'live' | 'rtc' = 'live'
): Promise<IAgoraRTCClient> {
  const AgoraRTC = await getAgoraRTC();
  const config: ClientConfig = { mode, codec: 'vp8' };
  return AgoraRTC.createClient(config);
}

// ─── Track Factories ──────────────────────────────────────────────────────────
export async function createMicrophoneTrack(): Promise<ILocalAudioTrack> {
  const AgoraRTC = await getAgoraRTC();
  return AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: 'music_standard',
    AEC: true,
    ANS: true,
    AGC: true,
  });
}

export async function createCanvasVideoTrack(
  canvas: HTMLCanvasElement,
  fps: number = 30
): Promise<ILocalVideoTrack> {
  const AgoraRTC = await getAgoraRTC();
  const stream     = canvas.captureStream(fps);
  const videoTrack = stream.getVideoTracks()[0];
  return AgoraRTC.createCustomVideoTrack({
    mediaStreamTrack: videoTrack,
    frameRate:        fps,
    bitrateMin:       400,
    bitrateMax:       1500,
  });
}

// ─── Channel Operations ───────────────────────────────────────────────────────
export async function joinChannel(
  client:      IAgoraRTCClient,
  channelName: string,
  token:       string | null = null,
  uid:         string | null = null
): Promise<string | number> {
  return client.join(APP_ID, channelName, token, uid);
}

export async function publishTracks(
  client: IAgoraRTCClient,
  tracks: Array<ILocalVideoTrack | ILocalAudioTrack>
): Promise<void> {
  await client.publish(tracks);
}

export async function leaveChannel(
  client: IAgoraRTCClient,
  tracks: Array<ILocalVideoTrack | ILocalAudioTrack>
): Promise<void> {
  tracks.forEach(t => t.close());
  await client.leave();
}
