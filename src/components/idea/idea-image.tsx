import Image from "next/image";
import type { IdeaImage } from "@/lib/content";

const altText = (image: IdeaImage, title: string) => image.alt || `Image illustrating “${title}”`;

/** The muted, paper-friendly treatment shared by every image on the site. */
const TONE = "saturate-[0.85] dark:brightness-[0.92]";

/**
 * Full image with its credit, for idea pages. Keeps the original proportions,
 * fills the column width on phones and never grows taller than most of the screen.
 */
export function IdeaFigure({ image, title, priority = false }: { image: IdeaImage; title: string; priority?: boolean }) {
  return (
    <figure className="border border-rule bg-sheet">
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={altText(image, title)}
        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 760px"
        priority={priority}
        className={`mx-auto h-auto max-h-[min(68svh,560px)] w-full object-contain ${TONE}`}
      />
      <figcaption className="label flex flex-wrap gap-x-2 gap-y-1 border-t border-rule px-3 py-2 text-[10.5px] normal-case tracking-[0.04em]">
        <span>Image: {image.credit}</span>
        <span aria-hidden>·</span>
        {image.licenseUrl ? (
          <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline hover:text-ink">
            {image.license}
          </a>
        ) : (
          <span>{image.license}</span>
        )}
        <span aria-hidden>·</span>
        <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
          Wikimedia Commons
        </a>
      </figcaption>
    </figure>
  );
}

/** A cropped thumbnail at a fixed ratio, for cards and the deck. */
export function IdeaThumb({
  image,
  title,
  className = "aspect-[3/2]",
  sizes = "(max-width: 640px) 84vw, (max-width: 1024px) 45vw, 380px",
}: {
  image: IdeaImage;
  title: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-sheet ${className}`}>
      <Image src={image.src} alt={altText(image, title)} fill sizes={sizes} className={`object-cover ${TONE}`} />
    </div>
  );
}
