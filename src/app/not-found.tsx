import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-28 text-center">
      <div className="label">No. 404</div>
      <h1 className="mt-4 text-[44px] font-medium leading-tight tracking-[-0.02em]">Not in the archive</h1>
      <p className="mt-3 text-[19px] italic text-ink-2">That page doesn’t exist, though plenty of others do.</p>
      <Link href="/" className="label mt-8 inline-flex min-h-11 items-center bg-accent px-6 text-accent-ink">
        Back to today
      </Link>
    </div>
  );
}
