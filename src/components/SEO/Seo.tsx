import { Helmet } from "react-helmet-async";
import { SeoMeta } from "@/types/seo";
import { buildAbsoluteUrl, buildAbsoluteImageUrl } from "@/utils/seo";

interface SeoProps {
  meta: SeoMeta;
}

/** Map language code (from URL prefix) to OG locale format. */
function toOgLocale(lang: string): string {
  return lang === "en" ? "en_US" : "sv_SE";
}

/** Detect language from a canonical path (e.g. "/en/about" → "en", "/sv/..." → "sv"). */
function detectLangFromPath(path: string): string {
  if (path.startsWith("/en")) return "en";
  return "sv";
}

function imageMimeType(imageUrl: string): string {
  const lower = imageUrl.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/png";
}

function HreflangLinks({
  hreflang,
}: {
  hreflang: NonNullable<SeoMeta["hreflang"]>;
}) {
  return (
    <>
      {hreflang.map(({ lang: hLang, href }) => (
        <link key={hLang} rel="alternate" hrefLang={hLang} href={href} />
      ))}
    </>
  );
}

function OpenGraphMeta({
  og,
  canonicalUrl,
  ogLocale,
  ogImage,
  ogImageWidth,
  ogImageHeight,
  ogImageAlt,
}: {
  og: NonNullable<SeoMeta["og"]>;
  canonicalUrl?: string;
  ogLocale: string;
  ogImage?: string;
  ogImageWidth: number;
  ogImageHeight: number;
  ogImageAlt: string;
}) {
  return (
    <>
      <meta property="og:site_name" content="Klimatkollen" />
      <meta property="og:locale" content={ogLocale} />
      {og.title && <meta property="og:title" content={og.title} />}
      {og.description && (
        <meta property="og:description" content={og.description} />
      )}
      {ogImage && (
        <>
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:width" content={String(ogImageWidth)} />
          <meta property="og:image:height" content={String(ogImageHeight)} />
          <meta property="og:image:alt" content={ogImageAlt} />
          <meta property="og:image:type" content={imageMimeType(ogImage)} />
        </>
      )}
      {og.type && <meta property="og:type" content={og.type} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
    </>
  );
}

function TwitterMeta({
  twitter,
  twitterImage,
  twitterImageAlt,
}: {
  twitter: NonNullable<SeoMeta["twitter"]>;
  twitterImage?: string;
  twitterImageAlt: string;
}) {
  return (
    <>
      {twitter.card && <meta name="twitter:card" content={twitter.card} />}
      <meta name="twitter:site" content="@klimatkollen" />
      {twitter.title && <meta name="twitter:title" content={twitter.title} />}
      {twitter.description && (
        <meta name="twitter:description" content={twitter.description} />
      )}
      {twitterImage && (
        <>
          <meta name="twitter:image" content={twitterImage} />
          <meta name="twitter:image:alt" content={twitterImageAlt} />
        </>
      )}
    </>
  );
}

function BasicMetaTags({
  title,
  description,
  canonicalUrl,
  noindex,
}: {
  title: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}) {
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </>
  );
}

function StructuredDataScript({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}

function resolveSeoImageUrls(meta: SeoMeta) {
  const canonicalUrl = meta.canonical
    ? buildAbsoluteUrl(meta.canonical)
    : undefined;
  const ogImage = meta.og?.image
    ? buildAbsoluteImageUrl(meta.og.image)
    : undefined;
  const twitterImage = meta.twitter?.image
    ? buildAbsoluteImageUrl(meta.twitter.image)
    : undefined;
  const lang = meta.canonical ? detectLangFromPath(meta.canonical) : "sv";
  const ogLocale = meta.og?.locale ?? toOgLocale(lang);
  return { canonicalUrl, ogImage, twitterImage, ogLocale };
}

/**
 * SEO component that renders meta tags based on a SeoMeta model.
 * Handles title, description, canonical, robots, hreflang, OpenGraph, and Twitter tags.
 */
export function Seo({ meta }: SeoProps) {
  const { title, description, noindex, hreflang, og, twitter, structuredData } =
    meta;
  const { canonicalUrl, ogImage, twitterImage, ogLocale } =
    resolveSeoImageUrls(meta);

  const ogImageWidth = og?.imageWidth ?? 1200;
  const ogImageHeight = og?.imageHeight ?? 630;
  const ogImageAlt = og?.imageAlt ?? title;
  const twitterImageAlt = twitter?.imageAlt ?? og?.imageAlt ?? title;

  return (
    <Helmet>
      <BasicMetaTags
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        noindex={noindex}
      />
      {hreflang && <HreflangLinks hreflang={hreflang} />}
      {og && (
        <OpenGraphMeta
          og={og}
          canonicalUrl={canonicalUrl}
          ogLocale={ogLocale}
          ogImage={ogImage}
          ogImageWidth={ogImageWidth}
          ogImageHeight={ogImageHeight}
          ogImageAlt={ogImageAlt}
        />
      )}
      {twitter && (
        <TwitterMeta
          twitter={twitter}
          twitterImage={twitterImage}
          twitterImageAlt={twitterImageAlt}
        />
      )}
      {structuredData && <StructuredDataScript data={structuredData} />}
    </Helmet>
  );
}
