import { useEffect, useRef } from "react";
import { mountClip, PRESETS, type ClipOpts } from "@/lib/clip-renderer";

type Props = {
  /** Path of the real video (site-config). Empty = animated preview drawn on canvas. */
  src?: string | undefined;
  preset?: "bruto" | "pronto";
  opts?: ClipOpts | undefined;
  className?: string;
  label?: string | undefined;
  /** Part of a group that plays together (carousel, before/after): loads the whole video up front. */
  grupo?: boolean;
};

export function Clip({ src, preset = "pronto", opts, className = "", label, grupo = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const merged = { ...PRESETS[preset], ...opts };
  const key = JSON.stringify(merged);
  const ctl = useRef<ReturnType<typeof mountClip> | null>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Real videos only play while on screen (saves data and battery on phones).
  // Inside a [data-clip-grupo] (gallery carousel, before/after) the whole group is observed, so the cards keep
  // playing while they slide in and out instead of pausing and freezing on the first frame.
  useEffect(() => {
    const node = video.current;
    if (!src || !node || typeof IntersectionObserver === "undefined") return;
    let quer = false;
    const tocar = () => {
      if (!quer || !node.paused) return;
      // still loading: try again as soon as there is a frame to show
      void node.play().catch(() => node.addEventListener("canplay", tocar, { once: true }));
    };
    const alvo = node.closest<HTMLElement>("[data-clip-grupo]") ?? node;
    const io = new IntersectionObserver(([entry]) => {
      quer = !!entry?.isIntersecting;
      if (quer) tocar();
      else node.pause();
    }, { rootMargin: "200px 0px" });
    io.observe(alvo);
    node.addEventListener("loadeddata", tocar);
    return () => {
      io.disconnect();
      node.removeEventListener("loadeddata", tocar);
      node.removeEventListener("canplay", tocar);
    };
  }, [src]);

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
        ref={video}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload={grupo ? "auto" : "metadata"}
        aria-label={label}
        className={`clip ${className}`}
      />
    );
  return <canvas ref={ref} aria-hidden="true" className={`clip ${className}`} />;
}
