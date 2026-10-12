import { Children } from "react";

/**
 * On phones: a horizontal row of cards that snaps one card at a time, with the next
 * card peeking in so it's clear you can swipe. From `sm` up: an ordinary grid.
 */
export function SwipeRow({ children, columns = "lg:grid-cols-3" }: { children: React.ReactNode; columns?: string }) {
  return (
    <div
      className={`no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 sm:overflow-visible sm:px-0 sm:pb-0 ${columns}`}
    >
      {Children.toArray(children).map((child, i) => (
        <div key={i} className="flex w-[84%] shrink-0 snap-start sm:w-auto [&>*]:w-full">
          {child}
        </div>
      ))}
    </div>
  );
}
