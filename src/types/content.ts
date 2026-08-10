export type ContentMeta = {
  id: string;
  title: string;
  titleEn?: string;
  slug?: string;
  excerpt: string;
  excerptEn?: string;
  date: string;
  readTime: string;
  category: string;
  image?: string;
  displayLanguages: string[]; // for filtering/visibility (e.g. ["all", "sv", "en"])
  language: "en" | "sv"; // for display of language article is written in (e.g. "English", "Svenska")
  link?: string;
  linkEn?: string;
  /** Former route segments or slugs that should still resolve to this report. */
  legacyReportIds?: string[];
  author?: {
    name: string;
    avatar?: string;
  };
  relatedPosts?: string[];
};
