import { Helmet } from "react-helmet-async";
import { SeoMeta } from "@/types/seo";
import { buildAbsoluteUrl, buildAbsoluteImageUrl } from "@/utils/seo";

interface SeoProps {
  meta: SeoMeta;
}

/**
 * SEO component that renders meta tags based on SeoMeta model
 * Handles title, description, canonical, robots, OpenGraph, and Twitter tags
 */
export function Seo({ meta }: SeoProps) {
  const { title, description, canonical, noindex, og, twitter } = meta;

  // Build absolute URLs
  const canonicalUrl = canonical ? buildAbsoluteUrl(canonical) : undefined;
  const ogImage = og?.image ? buildAbsoluteImageUrl(og.image) : undefined;
  const twitterImage = twitter?.image
    ? buildAbsoluteImageUrl(twitter.image)
    : undefined;

  return (
    <Helmet>
      <title>{title}</title>

      {description && <meta name="description" content={description} />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {og && (
        <>
          {og.title && <meta property="og:title" content={og.title} />}
          {og.description && (
            <meta property="og:description" content={og.description} />
          )}
          {ogImage && <meta property="og:image" content={ogImage} />}
          {og.type && <meta property="og:type" content={og.type} />}
          {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        </>
      )}

      {twitter && (
        <>
          {twitter.card && <meta name="twitter:card" content={twitter.card} />}
          {twitter.title && (
            <meta name="twitter:title" content={twitter.title} />
          )}
          {twitter.description && (
            <meta name="twitter:description" content={twitter.description} />
          )}
          {twitterImage && <meta name="twitter:image" content={twitterImage} />}
        </>
      )}
    </Helmet>
  );
}
