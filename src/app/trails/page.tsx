import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TrailCard } from "@/components/trail-card";
import { getAllTrails } from "@/lib/content";

export const metadata: Metadata = { title: "Trails" };

export default function TrailsPage() {
  const trails = getAllTrails();
  return (
    <div>
      <PageHeader
        eyebrow="Trails"
        title="Chains of ideas"
        subtitle="Curated paths where each idea leads to the next. Start anywhere, follow the thread, end up somewhere you didn’t expect."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {trails.map((t) => (
          <TrailCard key={t.slug} trail={t} />
        ))}
      </div>
    </div>
  );
}
