/**
 * Typed SEO metadata model
 */
export interface SeoMeta {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
  twitter?: {
    card?: "summary" | "summary_large_image";
    title?: string;
    description?: string;
    image?: string;
  };
}
