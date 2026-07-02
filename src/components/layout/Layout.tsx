import { ReactNode, useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Seo } from "@/components/SEO/Seo";
import { getSeoForRoute } from "@/seo/routes";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { SuggestEdit } from "./SuggestEdit";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const params = useParams();
  const isLandingPage = /^\/(sv|en)\/?$/.test(location.pathname);

  const isStagingHost =
    typeof window !== "undefined" &&
    window.location.hostname.includes("stage");

  // Get SEO metadata for current route
  const seoMeta = useMemo(() => {
    const meta = getSeoForRoute(
      location.pathname,
      params as Record<string, string>,
    );
    return isStagingHost ? { ...meta, noindex: true } : meta;
  }, [location.pathname, params, isStagingHost]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black-3 flex flex-col">
      <Seo meta={seoMeta} />
      <Header />
      <main
        className={
          isLandingPage
            ? "flex-1 min-h-0"
            : "flex-1 container mx-auto px-4 pt-24 pb-12 min-h-0"
        }
      >
        {children}
        <ScrollToTop />
        <SuggestEdit />
      </main>
      <Footer />
    </div>
  );
}
