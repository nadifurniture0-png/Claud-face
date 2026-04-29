'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Room } from '@/types';

export function useRooms() {
  const [rooms,   setRooms]   = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Real-time listener for all live rooms ──────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'rooms'),
      where('isLive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, snap => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
      setLoading(false);
    });

    return unsub;
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createRoom = async (
    hostId:   string,
    hostName: string,
    title:    string
  ): Promise<string> => {
    const ref = doc(collection(db, 'rooms'));
    await setDoc(ref, {
      hostId,
      hostName,
      title,
      isLive:      true,
      viewerCount: 0,
      createdAt:   Date.now(),
    } satisfies Omit<Room, 'id'>);
    return ref.id;
  };

  const endRoom = async (roomId: string): Promise<void> => {
    await updateDoc(doc(db, 'rooms', roomId), { isLive: false });
  };

  /**
   * Atomically increment/decrement viewer count.
   * In production, use a Cloud Function triggered by Agora webhooks
   * for accuracy — client-side counting can be gamed.
   */
  const adjustViewerCount = async (roomId: string, delta: 1 | -1): Promise<void> => {
    await updateDoc(doc(db, 'rooms', roomId), {
      viewerCount: increment(delta),
    });
  };

  return { rooms, loading, createRoom, endRoom, adjustViewerCount };
}
