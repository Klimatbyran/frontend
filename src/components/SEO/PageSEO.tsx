import { ReactNode } from "react";
import { SeoMeta } from "@/types/seo";
import { DEFAULT_OG_IMAGE } from "@/utils/seo";
import { Seo } from "./Seo";

interface PageSEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: string;
  ogImage?: string;
  /** Alt text for the social image — defaults to the page title. */
  ogImageAlt?: string;
  /** Actual pixel width of the OG image (default 1200). */
  ogImageWidth?: number;
  /** Actual pixel height of the OG image (default 630). */
  ogImageHeight?: number;
  twitterCard?: "summary" | "summary_large_image";
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
  children?: ReactNode;
}

function toCanonicalPath(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return new URL(url).pathname;
  }
  return url.startsWith("/") ? url : `/${url}`;
}

/**
 * Convenience wrapper for static pages — builds a SeoMeta and delegates to Seo.
 * Supports structured data (JSON-LD) and sr-only hidden content for crawlers.
 */
export function PageSEO({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  twitterCard = "summary_large_image",
  noindex = false,
  structuredData,
  children,
}: PageSEOProps) {
  const meta: SeoMeta = {
    title,
    description,
    canonical: toCanonicalPath(canonicalUrl),
    noindex,
    og: {
      title,
      description,
      image: ogImage,
      imageAlt: ogImageAlt ?? title,
      imageWidth: ogImageWidth,
      imageHeight: ogImageHeight,
      type: ogType,
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      image: ogImage,
      imageAlt: ogImageAlt ?? title,
    },
    structuredData,
  };

  return (
    <>
      <Seo meta={meta} />
      {children && <div className="sr-only">{children}</div>}
    </>
  );
}
