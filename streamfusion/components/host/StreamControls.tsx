'use client';
import { Mic, MicOff, Radio, StopCircle, Loader2, Sparkles } from 'lucide-react';
import { FaceFilterEffect } from '@/types';

const EFFECTS: { id: FaceFilterEffect; emoji: string; label: string }[] = [
  { id: 'beautify', emoji: '✨', label: 'Beautify' },
  { id: 'cartoon',  emoji: '🎨', label: 'Cartoon'  },
  { id: 'vintage',  emoji: '📷', label: 'Vintage'  },
  { id: 'neon',     emoji: '⚡', label: 'Neon'     },
  { id: 'none',     emoji: '🎥', label: 'Raw'      },
];

interface Props {
  isLive:           boolean;
  isMuted:          boolean;
  isStarting:       boolean;
  onStart:          () => void;
  onStop:           () => void;
  onToggleMute:     () => void;
  selectedEffect:   FaceFilterEffect;
  onEffectChange:   (e: FaceFilterEffect) => void;
}

export function StreamControls({
  isLive, isMuted, isStarting,
  onStart, onStop, onToggleMute,
  selectedEffect, onEffectChange,
}: Props) {
  return (
    <div className="bg-[#0a0a0a] border-t border-white/[0.06] p-4 space-y-4">
      {/* ── Filter Selector ─────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> AI Filter
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {EFFECTS.map(fx => (
            <button
              key={fx.id}
              onClick={() => onEffectChange(fx.id)}
              className={`
                shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all border
                ${selectedEffect === fx.id
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-white/[0.06] border-white/[0.08] text-white/50 hover:bg-white/10 hover:text-white/80'}
              `}
            >
              <span>{fx.emoji}</span>
              <span>{fx.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Action Row ──────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        {/* Mic toggle */}
        <button
          onClick={onToggleMute}
          disabled={!isLive}
          className={`
            p-3 rounded-xl border transition-all
            ${isMuted
              ? 'bg-red-950/60 border-red-500/40 text-red-400'
              : 'bg-white/[0.06] border-white/[0.08] text-white/60 hover:bg-white/10'}
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Go Live / End Stream */}
        {!isLive ? (
          <button
            onClick={onStart}
            disabled={isStarting}
            className="
              flex-1 flex items-center justify-center gap-2
              bg-gradient-to-r from-violet-600 to-fuchsia-600
              hover:from-violet-500 hover:to-fuchsia-500
              disabled:opacity-50 disabled:cursor-not-allowed
              rounded-xl py-3 font-semibold text-white transition-all
              shadow-[0_0_24px_rgba(139,92,246,0.3)]
            "
          >
            {isStarting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
              : <><Radio className="w-4 h-4" /> Go Live</>
            }
          </button>
        ) : (
          <button
            onClick={onStop}
            className="
              flex-1 flex items-center justify-center gap-2
              bg-red-600 hover:bg-red-500
              rounded-xl py-3 font-semibold text-white transition-all
            "
          >
            <StopCircle className="w-4 h-4" />
            End Stream
          </button>
        )}
      </div>
    </div>
  );
}
