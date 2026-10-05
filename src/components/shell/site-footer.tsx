import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-baseline gap-x-8 gap-y-2 px-5 py-8 sm:px-10">
        <span className="text-[17px] italic text-ink-2">Things worth knowing, worth remembering, worth talking about.</span>
        <nav aria-label="Footer" className="ml-auto flex flex-wrap gap-6">
          <Link href="/explore" className="label hover:text-ink">
            All ideas
          </Link>
          <Link href="/trails" className="label hover:text-ink">
            Trails
          </Link>
          <Link href="/topics" className="label hover:text-ink">
            Topics & modes
          </Link>
        </nav>
      </div>
    </footer>
  );
}
