'use client';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useChat } from '@/hooks/useChat';
import { Send } from 'lucide-react';

interface ChatBoxProps {
  roomId:   string;
  userId:   string;
  userName: string;
}

// Simple deterministic color per user (avoids harsh random picks each render)
const USER_COLORS = [
  'text-violet-400', 'text-fuchsia-400', 'text-cyan-400',
  'text-emerald-400', 'text-amber-400', 'text-rose-400',
];
function colorForUser(uid: string): string {
  let h = 0;
  for (const c of uid) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return USER_COLORS[Math.abs(h) % USER_COLORS.length];
}

export function ChatBox({ roomId, userId, userName }: ChatBoxProps) {
  const { messages, sendMessage } = useChat(roomId);
  const [input,     setInput]     = useState('');
  const [sending,   setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    await sendMessage(userId, userName, text);
    setSending(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="flex flex-col h-full bg-black/70 backdrop-blur-md">
      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-hide min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-white/25 text-xs pt-6">
            Chat is quiet… say something! 👋
          </p>
        )}

        {messages.map(msg => (
          <div key={msg.id} className="group leading-snug">
            <span className={`text-xs font-semibold mr-1.5 ${colorForUser(msg.userId)}`}>
              {msg.userId === userId ? 'You' : msg.userName}
            </span>
            <span className="text-sm text-white/80 break-words">{msg.text}</span>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 px-3 py-2.5 border-t border-white/[0.08]">
        <input
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 250))}
          onKeyDown={onKeyDown}
          placeholder="Say something…"
          disabled={sending}
          className={`
            flex-1 min-w-0 text-sm text-white placeholder-white/25
            bg-white/[0.08] rounded-lg px-3 py-2
            border border-transparent focus:border-violet-500/40
            outline-none transition-all
          `}
        />
        <button
          onClick={submit}
          disabled={!input.trim() || sending}
          className="shrink-0 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
