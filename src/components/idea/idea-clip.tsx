"use client";

import { useEffect, useRef, useState } from "react";
import type { IdeaMedia } from "@/lib/content";
import { CommonsCredit } from "./idea-image";

/**
 * A short video or animation with its caption and credit. Videos wait for the reader
 * to press play, so nothing downloads until then. Animations are silent loops that play
 * while on screen and pause when scrolled away, but never start on their own for readers
 * who ask their device for reduced motion.
 */
export function IdeaClip({ media, title }: { media: IdeaMedia; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const pausedByReader = useRef(false);
  const [playing, setPlaying] = useState(false);
  const animation = media.kind === "animation";

  useEffect(() => {
    const video = ref.current;
    if (!animation || !video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !pausedByReader.current) video.play().catch(() => {});
        else if (!entry.isIntersecting) video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [animation]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    pausedByReader.current = !video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <figure className="border border-rule bg-sheet">
      <video
        ref={ref}
        src={media.src}
        poster={media.poster}
        width={media.width}
        height={media.height}
        preload="none"
        playsInline
        controls={!animation}
        muted={animation}
        loop={animation}
        onClick={animation ? toggle : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={`${animation ? "Animation" : "Video"} for “${title}”: ${media.caption}`}
        // Small clips are shown at most twice their size, so they stay sharp.
        style={{ maxWidth: Math.max(media.width * 2, 320) }}
        className={`mx-auto block h-auto max-h-[min(68svh,560px)] w-full object-contain saturate-[0.85] dark:brightness-[0.92] ${animation ? "cursor-pointer" : ""}`}
      >
        <a href={media.src}>Download the {animation ? "animation" : "video"}</a>
      </video>
      <figcaption className="border-t border-rule px-3 py-2.5">
        <p className="text-[15.5px] italic leading-snug text-ink-2">{media.caption}</p>
        <div className="mt-1.5">
          <CommonsCredit label={animation ? "Animation" : "Video"} {...media}>
            {animation && (
              <button type="button" onClick={toggle} className="ml-auto min-h-8 px-1 uppercase tracking-[0.12em] text-ink underline">
                {playing ? "Pause" : "Play"}
              </button>
            )}
          </CommonsCredit>
        </div>
      </figcaption>
    </figure>
  );
}
