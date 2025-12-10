import { Helmet } from "react-helmet-async";
import { ReactNode } from "react";

interface PageSEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
  children?: ReactNode;
}

/**
 * Reusable SEO component for pages
 * Handles meta tags, structured data, and hidden SEO content
 */
export function PageSEO({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  ogImage = "/images/social-picture.png",
  structuredData,
  children,
}: PageSEOProps) {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonicalUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <link rel="canonical" href={canonicalUrl} />
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>

      {/* Hidden SEO content for search engines */}
      {children && <div className="sr-only">{children}</div>}
    </>
  );
}
