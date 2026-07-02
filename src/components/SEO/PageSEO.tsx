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
  structuredData,
  children,
}: PageSEOProps) {
  const meta: SeoMeta = {
    title,
    description,
    canonical: toCanonicalPath(canonicalUrl),
    og: {
      title,
      description,
      image: ogImage,
      type: ogType,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image: ogImage,
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
