import { useConfig } from "vike-react/useConfig";
import { ReactNode, useEffect } from "react";

interface PageSEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: string;
  ogImage?: string;
  structuredData?: Record<string, any>;
  children?: ReactNode;
}

/**
 * Reusable SEO component for pages using Vike head tags
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
  const config = useConfig();

  useEffect(() => {
    // Set head tags using Vike's useConfig
    config({
      title,
      description,
      Head: () => (
        <>
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
        </>
      ),
    });
  }, [title, description, canonicalUrl, ogType, ogImage, structuredData, config]);

  return (
    <>
      {/* Hidden SEO content for search engines */}
      {children && <div className="sr-only">{children}</div>}
    </>
  );
}
