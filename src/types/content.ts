export type ContentMeta = {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image?: string;
  displayLanguages: string[]; // for filtering/visibility (e.g. ["all", "sv", "en"])
  language: string; // for display of language article is written in (e.g. "English", "Svenska")
  link?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  relatedPosts?: string[];
};
