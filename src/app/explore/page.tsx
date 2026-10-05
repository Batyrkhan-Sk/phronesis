import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ExploreGrid } from "@/components/explore-grid";
import { getAllIdeas, summarize } from "@/lib/content";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  const ideas = getAllIdeas().map(summarize);
  return (
    <div>
      <PageHeader
        eyebrow="Explore"
        title="The whole archive"
        subtitle={`${ideas.length} ideas across ${new Set(ideas.flatMap((i) => i.topics)).size} subjects. Filter by what you’re curious about, or just wander.`}
      />
      <ExploreGrid ideas={ideas} />
    </div>
  );
}
