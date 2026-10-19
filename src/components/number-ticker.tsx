import { useEffect, useRef, useState } from 'react';

type Props = { value: number; format?: (value: number) => string; duration?: number; className?: string };

/** Animates from the previous value (starting at 0) to the new value once visible. */
export function NumberTicker({ value, format = v => Math.round(v).toLocaleString('pt-BR'), duration = 900, className }: Props) {
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplay(value); from.current = value; return; }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration)); // o 1º quadro pode vir com horário anterior ao início
      const eased = 1 - Math.pow(1 - t, 3);
      const current = origin + (value - origin) * eased;
      setDisplay(current);
      from.current = current;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, visible, duration]);

  return <span ref={ref} className={className} aria-label={format(value)}>{format(display)}</span>;
}
