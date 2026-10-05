import { LibraryTabs } from "@/components/library/library-tabs";

export default function LibraryLayout({ children }: LayoutProps<"/library">) {
  return (
    <div className="mx-auto max-w-[980px] pt-12 sm:pt-16">
      <div className="label mb-4">Your library</div>
      <LibraryTabs />
      <div className="mt-10">{children}</div>
    </div>
  );
}
