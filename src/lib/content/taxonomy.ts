/** Topics and discovery modes. */

export type Topic = { slug: string; name: string; blurb: string };

export const TOPICS = [
  { slug: "science", name: "Science", blurb: "How the world actually works." },
  { slug: "technology", name: "Technology", blurb: "Machines, code and the ideas behind them." },
  { slug: "ai", name: "Artificial Intelligence", blurb: "The long story of machines that think, or seem to." },
  { slug: "history", name: "History", blurb: "What happened, and why it still matters." },
  { slug: "geography", name: "Geography", blurb: "Places, borders and the shape of the Earth." },
  { slug: "psychology", name: "Psychology", blurb: "Why minds do what they do." },
  { slug: "philosophy", name: "Philosophy", blurb: "Old questions that refuse to go away." },
  { slug: "economics", name: "Economics", blurb: "Incentives, prices and unintended consequences." },
  { slug: "business", name: "Business", blurb: "Products, companies and how they came to be." },
  { slug: "art", name: "Art", blurb: "Images, objects and the stories around them." },
  { slug: "literature", name: "Literature", blurb: "Books, authors and the worlds they made." },
  { slug: "cinema", name: "Cinema", blurb: "Film, editing and the tricks of the screen." },
  { slug: "music", name: "Music", blurb: "Songs, sounds and their unlikely histories." },
  { slug: "language", name: "Language", blurb: "Words, grammar and where they came from." },
  { slug: "mathematics", name: "Mathematics", blurb: "Patterns, numbers and beautiful surprises." },
  { slug: "food", name: "Cuisine & Food", blurb: "Dishes, ingredients and the history on your plate." },
  { slug: "people", name: "People", blurb: "Remarkable lives, and what they changed." },
  { slug: "countries", name: "Countries", blurb: "Nations, borders, flags and their quirks." },
  { slug: "cities", name: "Cities", blurb: "How people built places to live together." },
  { slug: "law", name: "Law", blurb: "Rules, rights and the cases behind them." },
  { slug: "society", name: "Society", blurb: "Customs, institutions and how we live." },
  { slug: "religion", name: "Religion & Belief", blurb: "Faiths, calendars, customs and where they came from." },
  { slug: "fashion", name: "Fashion & Trends", blurb: "Clothes, styles and how trends rise, spread and return." },
  { slug: "nature", name: "Nature", blurb: "Animals, plants and other living strangeness." },
  { slug: "space", name: "Space", blurb: "Everything above the sky." },
  { slug: "inventions", name: "Inventions", blurb: "Things someone had to think of first." },
  { slug: "internet-culture", name: "Internet Culture", blurb: "Memes, laws and folklore of the online world." },
  { slug: "architecture", name: "Architecture", blurb: "Buildings and the ideas set in stone." },
  { slug: "design", name: "Design", blurb: "Type, layouts and decisions you never notice." },
  { slug: "everyday-life", name: "Everyday Life", blurb: "The ordinary, explained." },
] as const satisfies readonly Topic[];

export type TopicSlug = (typeof TOPICS)[number]["slug"];
export const TOPIC_SLUGS = TOPICS.map((t) => t.slug) as [TopicSlug, ...TopicSlug[]];
export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);

export type Mode = { slug: string; name: string; blurb: string };

export const MODES = [
  { slug: "learn-in-5", name: "Learn in 5 minutes", blurb: "A whole idea, start to finish, over a coffee." },
  { slug: "useful", name: "Useful to know", blurb: "Knowledge that quietly makes life easier." },
  { slug: "strange", name: "Strange but true", blurb: "Things that sound made up, and aren't." },
  { slug: "story", name: "The story behind…", blurb: "Origins of things you see every day." },
  { slug: "connections", name: "Hidden connections", blurb: "Where unrelated things turn out to meet." },
  { slug: "didnt-know", name: "Things you didn't know", blurb: "Small surprises with big afterlives." },
  { slug: "conversation", name: "Conversation starters", blurb: "Ready to bring up at dinner." },
  { slug: "deep-dive", name: "Deep dive", blurb: "For when one layer isn't enough." },
] as const satisfies readonly Mode[];

export type ModeSlug = (typeof MODES)[number]["slug"];
export const MODE_SLUGS = MODES.map((m) => m.slug) as [ModeSlug, ...ModeSlug[]];
export const modeBySlug = (slug: string) => MODES.find((m) => m.slug === slug);

export const CONNECTION_KINDS = {
  "leads-to": "Leads to",
  related: "Related",
  "same-pattern": "Same pattern",
  contrast: "In contrast",
  influenced: "Influenced",
  "part-of": "Part of",
} as const;
export type ConnectionKind = keyof typeof CONNECTION_KINDS;

export const CLAIM_STATUS = {
  established: { label: "Established", hint: "Well documented and broadly accepted." },
  interpretation: { label: "Interpretation", hint: "A reasonable reading of the evidence, not the only one." },
  disputed: { label: "Disputed", hint: "Experts genuinely disagree, or the evidence is weak." },
  anecdote: { label: "Anecdote", hint: "A good story without solid documentation." },
  myth: { label: "Myth", hint: "Popular, repeated, and not supported by evidence." },
} as const;
export type ClaimStatus = keyof typeof CLAIM_STATUS;
