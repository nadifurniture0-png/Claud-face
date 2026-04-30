'use client';
import Link from 'next/link';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Radio, LogOut, UserCircle2 } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthContext();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-white text-lg">
            Stream<span className="text-fuchsia-400">Fusion</span>
          </span>
        </Link>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-white/50">
              <UserCircle2 className="w-4 h-4" />
              <span className="font-medium text-white/70">{user.displayName}</span>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
