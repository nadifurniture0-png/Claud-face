// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  isLive: boolean;
  viewerCount: number;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}

export type FaceFilterEffect = 'none' | 'beautify' | 'cartoon' | 'vintage' | 'neon';

export interface FaceSwapOptions {
  effect?: FaceFilterEffect;
  intensity?: number;
}
