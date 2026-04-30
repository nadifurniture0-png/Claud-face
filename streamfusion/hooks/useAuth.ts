'use client';
import { useState, useEffect } from 'react';
import {
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// ─── Guest Name Generator ─────────────────────────────────────────────────────
const ADJ  = ['Swift','Cosmic','Neon','Mystic','Turbo','Ghost','Pixel','Cyber','Solar','Astro'];
const NOUN = ['Panda','Fox','Wolf','Eagle','Tiger','Dragon','Hawk','Lynx','Raven','Viper'];

function guestName(): string {
  const a = ADJ[Math.floor(Math.random()  * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  const d = Math.floor(Math.random() * 999);
  return `${a}${n}${d}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface AuthState {
  user:          User | null;
  loading:       boolean;
  signInAsGuest: (name?: string) => Promise<User>;
  logout:        () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInAsGuest = async (name?: string): Promise<User> => {
    const { user: u } = await signInAnonymously(auth);
    const displayName = name?.trim() || guestName();
    await updateProfile(u, { displayName });
    // Refresh local state immediately without waiting for the listener
    const refreshed = { ...u, displayName } as User;
    setUser(refreshed);
    return refreshed;
  };

  const logout = () => signOut(auth);

  return { user, loading, signInAsGuest, logout };
}
