'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ViewerRoom } from '@/components/viewer/ViewerRoom';
import { Room } from '@/types';
import { Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ViewerPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router  = useRouter();
  const params  = useParams();
  const roomId  = params.roomId as string;

  const [room,    setRoom]    = useState<Room | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) router.replace('/');
  }, [user, authLoading, router]);

  // Fetch room metadata once
  useEffect(() => {
    if (!roomId) return;
    getDoc(doc(db, 'rooms', roomId))
      .then(snap => {
        if (snap.exists()) setRoom({ id: snap.id, ...snap.data() } as Room);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setFetching(false));
  }, [roomId]);

  if (authLoading || fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !room) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500/60" />
        <p className="text-white/50 text-lg font-medium">Stream not found</p>
        <Link href="/" className="text-violet-400 text-sm hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <ViewerRoom
      roomId={room.id}
      roomTitle={room.title}
      hostName={room.hostName}
    />
  );
}
