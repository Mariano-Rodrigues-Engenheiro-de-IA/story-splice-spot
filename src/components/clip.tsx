import { useEffect, useRef } from "react";
import { mountClip, PRESETS, type ClipOpts } from "@/lib/clip-renderer";

type Props = {
  /** Path of the real video (site-config). Empty = animated preview drawn on canvas. */
  src?: string | undefined;
  preset?: "bruto" | "pronto";
  opts?: ClipOpts | undefined;
  className?: string;
  label?: string | undefined;
};

export function Clip({ src, preset = "pronto", opts, className = "", label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const merged = { ...PRESETS[preset], ...opts };
  const key = JSON.stringify(merged);
  const ctl = useRef<ReturnType<typeof mountClip> | null>(null);

  useEffect(() => {
    if (src || !ref.current) return;
    ctl.current = mountClip(ref.current, merged);
    return () => ctl.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    ctl.current?.set(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (src)
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className={`clip ${className}`}
      />
    );
  return <canvas ref={ref} aria-hidden="true" className={`clip ${className}`} />;
}
