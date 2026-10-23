import { useEffect, useRef, useState } from 'react';

type Props = { value: number; format?: (value: number) => string; duration?: number; className?: string };

/** Animates from the previous value (starting at 0) to the new value once visible.
 *  Visibility is measured on scroll and the count runs on a timer (not IntersectionObserver/requestAnimationFrame),
 *  so it also works inside iframe previews where those can stall. */
export function NumberTicker({ value, format = v => Math.round(v).toLocaleString('pt-BR'), duration = 900, className }: Props) {
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);

  useEffect(() => {
    if (visible) return;
    const check = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r && r.top < window.innerHeight * 0.9 && r.bottom > 0) setVisible(true);
    };
    check();
    const id = window.setInterval(check, 400);
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { window.clearInterval(id); window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplay(value); from.current = value; return; }
    const start = Date.now();
    const origin = from.current;
    const id = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const current = origin + (value - origin) * (1 - Math.pow(1 - t, 3));
      setDisplay(current);
      from.current = current;
      if (t >= 1) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
  }, [value, visible, duration]);

  return <span ref={ref} className={className} aria-label={format(value)}>{format(display)}</span>;
}
