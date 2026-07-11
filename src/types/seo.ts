/**
 * Typed SEO metadata model
 */
export interface SeoMeta {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  hreflang?: Array<{ lang: string; href: string }>;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    /** Alt text for the OG image (for accessibility and Twitter) */
    imageAlt?: string;
    /** Image dimensions — avoids platforms downloading the image to check size */
    imageWidth?: number;
    imageHeight?: number;
    type?: string;
    locale?: string;
  };
  twitter?: {
    card?: "summary" | "summary_large_image";
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
  };
  structuredData?: Record<string, unknown>;
}
