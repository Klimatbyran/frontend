import { ReactNode, useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getCompanies, getMunicipalities } from "@/lib/api";
import { Seo } from "@/components/SEO/Seo";
import { getSeoForRoute } from "@/seo/routes";
import { buildAbsoluteUrl, getSiteOrigin } from "@/utils/seo";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { SuggestEdit } from "./SuggestEdit";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Generate site-wide Organization and WebSite structured data
 * This is added to every page for consistent site identification
 */
function generateSiteWideStructuredData() {
  const siteOrigin = getSiteOrigin();
  const logoUrl = buildAbsoluteUrl("/logos/Klimatkollen_default.webp");

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Klimatkollen",
      url: siteOrigin,
      logo: logoUrl,
      description:
        "Open climate data for citizens. Track emissions and climate transition progress for companies and municipalities in Sweden.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Klimatkollen",
      url: siteOrigin,
      publisher: {
        "@type": "Organization",
        name: "Klimatkollen",
        logo: logoUrl,
      },
    },
  ];
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();

  // Get SEO metadata for current route
  const seoMeta = useMemo(() => {
    const routeSeo = getSeoForRoute(location.pathname, params as Record<string, string>);
    
    // Merge site-wide structured data with page-specific structured data
    const siteWideStructuredData = generateSiteWideStructuredData();
    const pageStructuredData = routeSeo.structuredData;
    
    // If page has structured data, combine with site-wide data
    // Otherwise, just use site-wide data
    const combinedStructuredData = pageStructuredData
      ? [...siteWideStructuredData, ...(Array.isArray(pageStructuredData) ? pageStructuredData : [pageStructuredData])]
      : siteWideStructuredData;

    return {
      ...routeSeo,
      structuredData: combinedStructuredData,
    };
  }, [location.pathname, params]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["companies"],
      queryFn: getCompanies,
    });

    queryClient.prefetchQuery({
      queryKey: ["municipalities"],
      queryFn: getMunicipalities,
    });
  }, [queryClient]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black-3 flex flex-col">
      <Seo meta={seoMeta} />
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 min-h-0">
        {children}
        <ScrollToTop />
        <SuggestEdit />
      </main>
      <Footer />
    </div>
  );
}
