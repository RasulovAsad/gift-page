import React, { useEffect, useRef, useState } from 'react';

export default function AsciiAnimationWindow({
  fps = 12.5,
  className = '',
}: {
  fps?: number;
  className?: string;
}) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const dirRef = useRef<'inc' | 'dec'>('inc');
  const rafRef = useRef<number | null>(null);
  const thenRef = useRef<number>(0);
  const fpsIntervalRef = useRef<number>(1000 / fps);

  const frames = (window as any).asciiFrames || [];
  const fit = (window as any).fitTextToContainer;

  // Подгоняем размер шрифта под ширину контейнера (как в твоём демо)
  const setPreCharSize = () => {
    const pre = preRef.current;
    if (!pre || frames.length === 0 || !fit) return;
    const charRatio = 0.66; // как в демо index.html
    const probeLine = (frames[0].split('\n')[1] || '').replace(/\r/g, '');
    const charWidth = fit(probeLine, 'monospace', pre.clientWidth) * charRatio;
    const charHeight = charRatio * charWidth;
    pre.style.fontSize = `${charWidth}px`;
    pre.style.lineHeight = `${charHeight}px`;
  };

  useEffect(() => {
    setPreCharSize();
    const onResize = () => setPreCharSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames.length]);

  useEffect(() => {
    fpsIntervalRef.current = 1000 / fps;
  }, [fps]);

  useEffect(() => {
    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      const then = thenRef.current || now;
      const elapsed = now - then;
      if (elapsed > fpsIntervalRef.current) {
        thenRef.current = now - (elapsed % fpsIntervalRef.current);
        step();
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames.length]);

  const step = () => {
    if (!frames.length) return;
    setFrameIndex((i) => {
      const max = frames.length;
      const dir = dirRef.current;
      if (dir === 'inc') {
        if (i >= max - 1) {
          dirRef.current = 'dec';
          return i - 1;
        }
        return i + 1;
      } else {
        if (i <= 0) {
          dirRef.current = 'inc';
          return i + 1;
        }
        return i - 1;
      }
    });
  };

  return (
    <pre
      ref={preRef}
      className={`w-full max-w-[720px] h-96 md:h-[32rem] mx-auto overflow-hidden rounded-2xl border border-dashed grid place-items-center bg-white/70 font-mono ${className}`}
    >
      <span style={{ whiteSpace: 'pre' }}>
        {frames.length ? frames[frameIndex] : 'Загружаю кадры…'}
      </span>
    </pre>
  );
}
