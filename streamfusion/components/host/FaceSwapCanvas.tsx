'use client';
import {
  useEffect, useRef, forwardRef, useImperativeHandle,
} from 'react';
import { applyFaceSwapEffect, stopFaceSwapEffect } from '@/lib/faceSwap';
import { FaceSwapOptions } from '@/types';

// ─── Public handle exposed to parent via ref ───────────────────────────────────
export interface FaceSwapCanvasHandle {
  /** The processed canvas element — pass to captureStream() or Agora */
  canvas: HTMLCanvasElement | null;
}

interface Props {
  videoStream: MediaStream | null;
  options?:    FaceSwapOptions;
  className?:  string;
}

/**
 * FaceSwapCanvas
 * ──────────────
 * Renders the webcam into a hidden <video>, processes each frame through
 * `applyFaceSwapEffect`, and outputs the result to a <canvas>.
 *
 * The parent can access the canvas via ref.canvas to call captureStream().
 */
export const FaceSwapCanvas = forwardRef<FaceSwapCanvasHandle, Props>(
  ({ videoStream, options, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef  = useRef<HTMLVideoElement>(null);

    // Expose canvas to parent
    useImperativeHandle(ref, () => ({
      get canvas() { return canvasRef.current; },
    }));

    useEffect(() => {
      if (!videoStream || !videoRef.current || !canvasRef.current) return;

      const video  = videoRef.current;
      const canvas = canvasRef.current;

      video.srcObject = videoStream;
      video.play().catch(console.error);

      const onReady = () => applyFaceSwapEffect(video, canvas, options);
      video.addEventListener('loadeddata', onReady);

      // If already ready (hot reload)
      if (video.readyState >= 2) onReady();

      return () => {
        video.removeEventListener('loadeddata', onReady);
        stopFaceSwapEffect();
        video.srcObject = null;
      };
      // Re-run if options.effect changes (user switches filter)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoStream, options?.effect]);

    return (
      <div className={`relative overflow-hidden ${className ?? ''}`}>
        {/* Hidden source — only the canvas is shown */}
        <video ref={videoRef} muted playsInline className="hidden" aria-hidden />

        {/* Processed output — this is what gets streamed */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          aria-label="Live camera with AI filter applied"
        />
      </div>
    );
  }
);

FaceSwapCanvas.displayName = 'FaceSwapCanvas';
