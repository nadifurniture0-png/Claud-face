import Link from 'next/link';
import { Room } from '@/types';
import { Users } from 'lucide-react';

export function RoomCard({ room }: { room: Room }) {
  // Deterministic gradient per room (visual variety)
  const gradients = [
    'from-violet-900/70 via-fuchsia-900/40 to-black',
    'from-cyan-900/70 via-blue-900/40 to-black',
    'from-rose-900/70 via-orange-900/40 to-black',
    'from-emerald-900/70 via-teal-900/40 to-black',
  ];
  const grad = gradients[room.id.charCodeAt(0) % gradients.length];

  return (
    <Link href={`/viewer/${room.id}`} className="block group">
      <div className="rounded-xl overflow-hidden border border-white/[0.08] hover:border-violet-500/40 transition-all duration-200 bg-white/[0.03] hover:bg-white/[0.06]">
        {/* Thumbnail */}
        <div className={`aspect-video bg-gradient-to-br ${grad} relative flex items-center justify-center`}>
          {/* Animated waveform bars */}
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-white/20 rounded-full"
                style={{
                  height: `${30 + Math.sin(i * 1.3) * 20}%`,
                  animation: `pulse 1.${i}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>

          {/* LIVE badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-red-600/90 rounded px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-white">LIVE</span>
          </div>
        </div>

        {/* Meta */}
        <div className="px-3 py-2.5">
          <p className="font-semibold text-white text-sm truncate">{room.title}</p>
          <p className="text-white/40 text-xs mt-0.5 truncate">{room.hostName}</p>
          <div className="flex items-center gap-1.5 mt-2 text-white/30 text-xs">
            <Users className="w-3 h-3" />
            <span>{room.viewerCount.toLocaleString()} watching</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
