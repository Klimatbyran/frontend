import { buildAbsoluteUrl, getSiteOrigin } from "@/utils/seo";
import { ContentMeta } from "@/types/content";

const SITE_NAME = "Klimatkollen";
const SITE_LOGO = "/logos/Klimatkollen_default.webp";

/**
 * Convert read time string (e.g., "5 min") to ISO 8601 duration (e.g., "PT5M")
 * @param readTime - Read time string like "5 min" or "10 minutes"
 * @returns ISO 8601 duration string
 */
function parseReadTime(readTime: string): string | undefined {
  const match = readTime.match(/(\d+)\s*(?:min|minute|minutes?|m)/i);
  if (match) {
    const minutes = parseInt(match[1], 10);
    return `PT${minutes}M`;
  }
  return undefined;
}

/**
 * Generate Article structured data for blog posts
 * @param metadata - Blog post metadata
 * @param canonicalUrl - Absolute canonical URL
 * @param imageUrl - Absolute image URL
 * @returns JSON-LD structured data object
 */
export function generateArticleStructuredData(
  metadata: ContentMeta,
  canonicalUrl: string,
  imageUrl?: string,
): Record<string, unknown> {
  const siteOrigin = getSiteOrigin();
  const logoUrl = buildAbsoluteUrl(SITE_LOGO);
  
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: metadata.title,
    description: metadata.excerpt,
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
  };

  // Add date published
  if (metadata.date) {
    // Ensure date is in ISO format
    const date = new Date(metadata.date);
    if (!isNaN(date.getTime())) {
      structuredData.datePublished = date.toISOString();
    }
  }

  // Add author if available
  if (metadata.author?.name) {
    structuredData.author = {
      "@type": "Person",
      name: metadata.author.name,
    };
    if (metadata.author.avatar) {
      (structuredData.author as Record<string, unknown>).image = buildAbsoluteUrl(metadata.author.avatar);
    }
  }

  // Add image if available
  if (imageUrl) {
    structuredData.image = imageUrl;
  } else if (metadata.image) {
    structuredData.image = buildAbsoluteUrl(metadata.image);
  }

  // Add article section (category)
  if (metadata.category) {
    structuredData.articleSection = metadata.category;
  }

  // Add read time if available
  if (metadata.readTime) {
    const duration = parseReadTime(metadata.readTime);
    if (duration) {
      structuredData.timeRequired = duration;
    }
  }

  return structuredData;
}

/**
 * Generate Report structured data for reports
 * @param title - Report title
 * @param description - Report description/excerpt
 * @param canonicalUrl - Absolute canonical URL
 * @param pdfUrl - Absolute URL to PDF file
 * @param imageUrl - Absolute image URL (optional)
 * @returns JSON-LD structured data object
 */
export function generateReportStructuredData(
  title: string,
  description: string,
  canonicalUrl: string,
  pdfUrl: string,
  imageUrl?: string,
): Record<string, unknown> {
  const siteOrigin = getSiteOrigin();
  const logoUrl = buildAbsoluteUrl(SITE_LOGO);

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Report",
    headline: title,
    description: description,
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
  };

  // Add PDF as associated media
  if (pdfUrl) {
    structuredData.associatedMedia = {
      "@type": "MediaObject",
      contentUrl: pdfUrl.startsWith("http") ? pdfUrl : buildAbsoluteUrl(pdfUrl),
      encodingFormat: "application/pdf",
    };
  }

  // Add image if available
  if (imageUrl) {
    structuredData.image = imageUrl;
  }

  return structuredData;
}
