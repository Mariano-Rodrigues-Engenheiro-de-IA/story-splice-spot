import { useEffect, useRef, useState } from "react";
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

  // Real videos only load when the visitor gets close and only play while on screen: the page opens light and the
  // sales video gets the whole connection. Inside a [data-clip-grupo] (gallery carousel, before/after) the whole
  // group is observed, so the cards keep playing while they slide in and out instead of freezing on the first frame.
  const [perto, setPerto] = useState(false);
  const quer = useRef(false);
  useEffect(() => {
    const node = video.current;
    if (!src || !node) return;
    if (typeof IntersectionObserver === "undefined") return setPerto(true);
    const alvo = node.closest<HTMLElement>("[data-clip-grupo]") ?? node;
    const io = new IntersectionObserver(([entry]) => {
      quer.current = !!entry?.isIntersecting;
      if (quer.current) {
        setPerto(true);
        if (node.src) void node.play().catch(() => undefined);
      } else node.pause();
    }, { rootMargin: "120px 0px" });
    io.observe(alvo);
    return () => io.disconnect();
  }, [src]);

  // once the file is attached: play as soon as there is a frame (and retry if the first try came too early)
  useEffect(() => {
    const node = video.current;
    if (!perto || !node) return;
    const tocar = () => {
      if (quer.current && node.paused) void node.play().catch(() => node.addEventListener("canplay", tocar, { once: true }));
    };
    node.addEventListener("loadeddata", tocar);
    tocar();
    return () => {
      node.removeEventListener("loadeddata", tocar);
      node.removeEventListener("canplay", tocar);
    };
  }, [perto]);

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
        src={perto ? src : undefined}
        muted
        loop
        playsInline
        preload={perto ? (grupo ? "auto" : "metadata") : "none"}
        aria-label={label}
        className={`clip ${className}`}
      />
    );
  return <canvas ref={ref} aria-hidden="true" className={`clip ${className}`} />;
}
