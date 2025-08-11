'use client';

import { useEffect, useRef } from 'react';

interface AnimatedCodeBackgroundProps {
  className?: string;
  density?: number; // characters per 100px width
  speed?: number; // pixels per frame
  color?: string; // rgba color for glyphs
}

// Subtle moving code background rendered on a canvas. Optimized for low CPU usage.
export default function AnimatedCodeBackground({
  className,
  density = 1.2,
  speed = 1.2,
  color = 'rgba(31,41,55,0.08)', // slate-800 @ 8%
}: AnimatedCodeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup size and DPR
    const setSize = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    const chars = '{ } ( ) [ ] < > = + - * / ! & | ^ : ; , . 0 1 2 3 4 5 6 7 8 9 a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ');

    type Stream = {
      x: number; // column x in px
      y: number; // current y in px
      fontSize: number; // px
      step: number; // drift speed multiplier
    };

    let streams: Stream[] = [];

    const initStreams = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const baseFont = 14; // base font size in px
      const columns = Math.max(16, Math.floor((width / 100) * density * 10));
      streams = new Array(columns).fill(0).map((_, i) => {
        const fontSize = baseFont + Math.floor(Math.random() * 6); // 14-20
        const x = Math.floor((i + Math.random() * 0.5) * (width / columns));
        const y = Math.floor(-Math.random() * height);
        const step = 0.75 + Math.random() * 0.75; // 0.75 - 1.5
        return { x, y, fontSize, step };
      });
    };
    initStreams();

    let frame = 0;
    const draw = () => {
      frame++;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Fade the canvas slightly to create trailing effect
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.textBaseline = 'top';

      for (let i = 0; i < streams.length; i++) {
        const s = streams[i];
        ctx.font = `${s.fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
        // Draw 2-3 characters per column each frame for subtle density
        const count = 2 + (frame % 3 === 0 ? 1 : 0);
        for (let j = 0; j < count; j++) {
          const ch = chars[(Math.random() * chars.length) | 0];
          const jitterX = (Math.random() - 0.5) * 2; // tiny jitter
          ctx.fillText(ch, s.x + jitterX, s.y + j * s.fontSize);
        }
        s.y += speed * s.step * s.fontSize * 0.35;
        if (s.y > height + 40) {
          s.y = -Math.random() * height * 0.5;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const handleResize = () => {
      setSize();
      initStreams();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className || ''}`}
      aria-hidden="true"
    />
  );
}


