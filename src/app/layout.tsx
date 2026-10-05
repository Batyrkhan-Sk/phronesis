import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/shell/app-shell";
import { getAllIdeas, getAllTrails, summarize } from "@/lib/content";
import "./globals.css";

const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Phronesis — Things worth knowing", template: "%s · Phronesis" },
  description: "Things worth knowing, things worth remembering, and things worth talking about.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const index = getAllIdeas().map(summarize);
  const trails = getAllTrails().map((t) => ({ slug: t.slug, title: t.title, description: t.description }));

  return (
    <html lang="en" suppressHydrationWarning className={`${newsreader.variable} ${plexMono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppShell index={index} trails={trails}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
