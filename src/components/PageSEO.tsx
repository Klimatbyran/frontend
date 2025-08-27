import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/components/LanguageProvider";

interface PageSEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  keywords?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export function PageSEO({
  title,
  description,
  canonicalUrl,
  ogImage = "/images/social-picture.png",
  ogType = "website",
  keywords,
  structuredData,
  noIndex = false,
}: PageSEOProps) {
  const { currentLanguage } = useLanguage();
  const locale = currentLanguage === "sv" ? "sv_SE" : "en_US";
  const baseUrl = "https://klimatkollen.se";

  // Client-only location values
  const [locationHref, setLocationHref] = useState("");
  const [locationPathname, setLocationPathname] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocationHref(window.location.href);
      setLocationPathname(window.location.pathname);
    }
  }, []);

  const fullCanonicalUrl = canonicalUrl || locationHref || baseUrl;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Klimatkollen" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content="Klimatkollen" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@klimatkollen" />
      <meta name="twitter:creator" content="@klimatkollen" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Language Alternates */}
      <link rel="alternate" hreflang="sv" href={canonicalUrl ? `${baseUrl}${canonicalUrl.replace("/en", "")}` : `${baseUrl}${clientPathname.replace("/en", "")}`} />
      <link rel="alternate" hreflang="en" href={canonicalUrl ? `${baseUrl}/en${canonicalUrl.replace("/en", "")}` : `${baseUrl}/en${clientPathname.replace("/en", "")}`} />
      <link rel="alternate" hreflang="x-default" href={canonicalUrl ? `${baseUrl}${canonicalUrl.replace("/en", "")}` : `${baseUrl}${clientPathname.replace("/en", "")}`} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
