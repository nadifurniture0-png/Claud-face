'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatMessage } from '@/types';

const MAX_MESSAGES = 120;

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(MAX_MESSAGES)
    );

    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
    });

    return unsub;
  }, [roomId]);

  const sendMessage = async (
    userId:   string,
    userName: string,
    text:     string
  ): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed || !roomId) return;

    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      userId,
      userName,
      text: trimmed.slice(0, 250), // cap at 250 chars
      createdAt: Date.now(),
    } satisfies Omit<ChatMessage, 'id'>);
  };

  return { messages, sendMessage };
}
